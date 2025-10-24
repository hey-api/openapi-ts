import type ts from 'typescript';

import { deduplicateSchema } from '~/ir/schema';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import type { SchemaWithType } from '~/plugins';
import { toRefs } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';
import { refToName } from '~/utils/ref';

import { createClientOptions } from '../shared/clientOptions';
import { exportType } from '../shared/export';
import { operationToType } from '../shared/operation';
import type { IrSchemaToAstOptions } from '../shared/types';
import { webhookToType } from '../shared/webhook';
import { createWebhooks } from '../shared/webhooks';
import type { HeyApiTypeScriptPlugin } from '../types';
import { irSchemaWithTypeToAst } from './toAst';

export const irSchemaToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
}): ts.TypeNode => {
  if (schema.$ref) {
    const symbol = plugin.referenceSymbol(
      plugin.api.selector('ref', schema.$ref),
    );
    return tsc.typeReferenceNode({ typeName: symbol.placeholder });
  }

  if (schema.type) {
    return irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
  }

  if (schema.items) {
    schema = deduplicateSchema({ detectFormat: false, schema });
    if (schema.items) {
      const itemTypes: Array<ts.TypeNode> = [];

      for (const item of schema.items) {
        const type = irSchemaToAst({ plugin, schema: item, state });
        itemTypes.push(type);
      }

      return schema.logicalOperator === 'and'
        ? tsc.typeIntersectionNode({ types: itemTypes })
        : tsc.typeUnionNode({ types: itemTypes });
    }

    return irSchemaToAst({ plugin, schema, state });
  }

  // catch-all fallback for failed schemas
  return irSchemaWithTypeToAst({
    plugin,
    schema: {
      type: 'unknown',
    },
    state,
  });
};

const handleComponent = ({
  $ref,
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  $ref: string;
  schema: IR.SchemaObject;
}) => {
  const type = irSchemaToAst({ plugin, schema, state });

  // Don't tag enums as 'type' since they export runtime artifacts (values)
  const isEnum = schema.type === 'enum' && plugin.config.enums.enabled;

  const symbol = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: isEnum ? undefined : 'type',
      path: state.path.value,
    },
    name: buildName({
      config: plugin.config.definitions,
      name: refToName($ref),
    }),
    selector: plugin.api.selector('ref', $ref),
  });
  exportType({
    plugin,
    schema,
    symbol,
    type,
  });
};

export const handlerV1: HeyApiTypeScriptPlugin['Handler'] = ({ plugin }) => {
  // reserve identifier for ClientOptions
  const symbolClientOptions = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
      path: [],
    },
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'ClientOptions',
    }),
    selector: plugin.api.selector('ClientOptions'),
  });
  // reserve identifier for Webhooks
  const symbolWebhooks = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
      path: [],
    },
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'Webhooks',
    }),
    selector: plugin.api.selector('Webhooks'),
  });

  const servers: Array<IR.ServerObject> = [];
  const webhookNames: Array<string> = [];

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'server',
    'webhook',
    (event) => {
      switch (event.type) {
        case 'operation':
          operationToType({
            operation: event.operation,
            plugin,
            state: toRefs({
              path: event._path,
            }),
          });
          break;
        case 'parameter':
          handleComponent({
            $ref: event.$ref,
            plugin,
            schema: event.parameter.schema,
            state: toRefs({
              path: event._path,
            }),
          });
          break;
        case 'requestBody':
          handleComponent({
            $ref: event.$ref,
            plugin,
            schema: event.requestBody.schema,
            state: toRefs({
              path: event._path,
            }),
          });
          break;
        case 'schema':
          handleComponent({
            $ref: event.$ref,
            plugin,
            schema: event.schema,
            state: toRefs({
              path: event._path,
            }),
          });
          break;
        case 'server':
          servers.push(event.server);
          break;
        case 'webhook':
          webhookNames.push(
            webhookToType({
              operation: event.operation,
              plugin,
              state: toRefs({
                path: event._path,
              }),
            }),
          );
          break;
      }
    },
    {
      order: 'declarations',
    },
  );

  createClientOptions({ plugin, servers, symbolClientOptions });
  createWebhooks({ plugin, symbolWebhooks, webhookNames });
};
