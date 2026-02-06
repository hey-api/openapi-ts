import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef, ref, refs } from '@hey-api/codegen-core';
import type { IR, SchemaWithType } from '@hey-api/shared';
import { applyNaming, deduplicateSchema, pathToJsonPointer, refToName } from '@hey-api/shared';

import { $ } from '../../../py-dsl';
import { exportAst } from '../shared/export';
import type { Ast, IrSchemaToAstOptions, PluginState } from '../shared/types';
import type { PydanticPlugin } from '../types';
import { irSchemaWithTypeToAst } from './toAst';

export function irSchemaToAst({
  optional,
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  optional?: boolean;
  schema: IR.SchemaObject;
}): Ast {
  if (schema.$ref) {
    const query: SymbolMeta = {
      category: 'schema',
      resource: 'definition',
      resourceId: schema.$ref,
      tool: 'pydantic',
    };
    const refSymbol = plugin.referenceSymbol(query);
    const refName = typeof refSymbol === 'string' ? refSymbol : refSymbol.name;

    return {
      expression: $.expr(refName),
      fieldConstraints: optional ? { default: null } : undefined,
      hasLazyExpression: !plugin.isSymbolRegistered(query),
      pipes: [],
      typeAnnotation: refName,
    };
  }

  if (schema.type) {
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });

    const constraints: Record<string, unknown> = {};
    if (optional) {
      constraints.default = null;
    }
    if (schema.default !== undefined) {
      constraints.default = schema.default;
    }
    if (schema.description) {
      constraints.description = schema.description;
    }

    return {
      ...typeAst,
      fieldConstraints: { ...typeAst.fieldConstraints, ...constraints },
      pipes: [],
    };
  }

  if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemsAnnotations: string[] = [];
      const itemsConstraints: Record<string, unknown>[] = [];

      for (const item of schema.items) {
        const itemAst = irSchemaToAst({
          plugin,
          schema: item,
          state: {
            ...state,
            path: ref([...fromRef(state.path), 'items']),
          },
        });
        itemsAnnotations.push(itemAst.typeAnnotation);
        if (itemAst.fieldConstraints) {
          itemsConstraints.push(itemAst.fieldConstraints);
        }
      }

      const unionType = itemsAnnotations.join(' | ');
      return {
        expression: $.expr(`list[${unionType}]`),
        fieldConstraints: itemsConstraints.length > 0 ? itemsConstraints[0] : undefined,
        hasLazyExpression: false,
        pipes: [],
        typeAnnotation: `list[${unionType}]`,
      };
    }
  }

  return {
    expression: $.expr('Any'),
    hasLazyExpression: false,
    pipes: [],
    typeAnnotation: 'Any',
  };
}

function handleComponent({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
}): void {
  const $ref = pathToJsonPointer(fromRef(state.path));
  const ast = irSchemaToAst({ plugin, schema, state });
  const baseName = refToName($ref);
  const symbol = plugin.symbol(applyNaming(baseName, plugin.config.definitions), {
    meta: {
      category: 'schema',
      path: fromRef(state.path),
      resource: 'definition',
      resourceId: $ref,
      tags: fromRef(state.tags),
      tool: 'pydantic',
    },
  });
  exportAst({
    ast,
    plugin,
    schema,
    state,
    symbol,
  });
}

export const handlerV2: PydanticPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('Any', {
    external: 'typing',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'typing.Any',
    },
  });
  plugin.symbol('BaseModel', {
    external: 'pydantic',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'pydantic.BaseModel',
    },
  });
  plugin.symbol('ConfigDict', {
    external: 'pydantic',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'pydantic.ConfigDict',
    },
  });
  plugin.symbol('Field', {
    external: 'pydantic',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'pydantic.Field',
    },
  });
  plugin.symbol('Literal', {
    external: 'typing',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'typing.Literal',
    },
  });
  plugin.symbol('Optional', {
    external: 'typing',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'typing.Optional',
    },
  });

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', 'webhook', (event) => {
    const state = refs<PluginState>({
      hasLazyExpression: false,
      path: event._path,
      tags: event.tags,
    });

    switch (event.type) {
      case 'parameter':
        handleComponent({
          plugin,
          schema: event.parameter.schema,
          state,
        });
        break;
      case 'requestBody':
        handleComponent({
          plugin,
          schema: event.requestBody.schema,
          state,
        });
        break;
      case 'schema':
        handleComponent({
          plugin,
          schema: event.schema,
          state,
        });
        break;
    }
  });
};
