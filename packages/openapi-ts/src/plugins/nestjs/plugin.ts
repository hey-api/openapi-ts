import type { IR } from '@hey-api/shared';
import { hasParameterGroupObjectRequired, operationResponsesMap, toCase } from '@hey-api/shared';

import { $ } from '../../ts-dsl';
import type { NestJSPlugin } from './types';

const operationToMethod = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: NestJSPlugin['Instance'];
}) => {
  const funcType = $.type.func();

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });

  if (symbolDataType) {
    // Collect params so we can sort required before optional.
    // Without this, TypeScript would reject signatures like
    // (query?: T, body: U) => ... where optional precedes required.
    const params: Array<{
      isRequired: boolean;
      key: string;
    }> = [];

    if (operation.parameters?.path) {
      params.push({
        isRequired: hasParameterGroupObjectRequired(operation.parameters.path),
        key: 'path',
      });
    }

    if (operation.parameters?.query) {
      params.push({
        isRequired: hasParameterGroupObjectRequired(operation.parameters.query),
        key: 'query',
      });
    }

    if (operation.body) {
      params.push({
        isRequired: operation.body.required ?? false,
        key: 'body',
      });
    }

    if (operation.parameters?.header) {
      params.push({
        isRequired: hasParameterGroupObjectRequired(operation.parameters.header),
        key: 'headers',
      });
    }

    // Stable sort: required params first, optional params last
    params.sort((a, b) => (a.isRequired === b.isRequired ? 0 : a.isRequired ? -1 : 1));

    for (const param of params) {
      funcType.param(param.key, (p) =>
        p.required(param.isRequired).type($.type(symbolDataType).idx($.type.literal(param.key))),
      );
    }
  }

  // Use the response type alias (union of success bodies), not the
  // status-code-indexed responses map. NestJS controllers return values
  // directly, not status-code mappings.
  const { responses } = operationResponsesMap(operation);

  const symbolResponseType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'response',
    tool: 'typescript',
  });

  if (symbolResponseType && responses) {
    funcType.returns($.type('Promise', (t) => t.generic($.type(symbolResponseType))));
  } else {
    funcType.returns($.type('Promise', (t) => t.generic($.type('void'))));
  }

  return {
    name: operation.id,
    type: funcType,
  };
};

const emitTypeAlias = ({
  methods,
  plugin,
  typeName,
}: {
  methods: Array<{ name: string; type: ReturnType<typeof $.type.func> }>;
  plugin: NestJSPlugin['Instance'];
  typeName: string;
}) => {
  const symbol = plugin.symbol(typeName);
  const type = $.type.object();
  for (const method of methods) {
    type.prop(method.name, (p) => p.type(method.type));
  }
  plugin.node($.type.alias(symbol).export().type(type));
};

export const handler: NestJSPlugin['Handler'] = ({ plugin }) => {
  if (plugin.config.groupByTag) {
    // Collect operations by tag, then emit per-tag types
    const operationsByTag = new Map<
      string,
      Array<{ name: string; type: ReturnType<typeof $.type.func> }>
    >();

    plugin.forEach(
      'operation',
      ({ operation, tags }) => {
        const tag = tags?.[0] ?? 'default';
        if (!operationsByTag.has(tag)) {
          operationsByTag.set(tag, []);
        }
        const method = operationToMethod({ operation, plugin });
        operationsByTag.get(tag)!.push(method);
      },
      {
        order: 'declarations',
      },
    );

    for (const [tag, methods] of operationsByTag) {
      const pascalTag = toCase(tag, 'PascalCase');
      emitTypeAlias({
        methods,
        plugin,
        typeName: `${pascalTag}ControllerMethods`,
      });
      emitTypeAlias({
        methods,
        plugin,
        typeName: `${pascalTag}ServiceMethods`,
      });
    }
  } else {
    // Flat mode: single ControllerMethods + ServiceMethods
    const methods: Array<{
      name: string;
      type: ReturnType<typeof $.type.func>;
    }> = [];

    plugin.forEach(
      'operation',
      ({ operation }) => {
        const method = operationToMethod({ operation, plugin });
        methods.push(method);
      },
      {
        order: 'declarations',
      },
    );

    emitTypeAlias({ methods, plugin, typeName: 'ControllerMethods' });
    emitTypeAlias({ methods, plugin, typeName: 'ServiceMethods' });
  }
};
