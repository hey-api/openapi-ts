import type { IR } from '@hey-api/shared';
import { hasParameterGroupObjectRequired, operationResponsesMap } from '@hey-api/shared';

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

export const handler: NestJSPlugin['Handler'] = ({ plugin }) => {
  const symbolControllerMethods = plugin.symbol('ControllerMethods');

  const type = $.type.object();

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const method = operationToMethod({ operation, plugin });
      if (method) {
        type.prop(method.name, (p) => p.type(method.type));
      }
    },
    {
      order: 'declarations',
    },
  );

  const node = $.type.alias(symbolControllerMethods).export().type(type);
  plugin.node(node);
};
