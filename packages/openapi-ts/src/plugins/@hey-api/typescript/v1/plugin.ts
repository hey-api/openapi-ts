import type { Symbol } from '@hey-api/codegen-core';
import { refs } from '@hey-api/codegen-core';

import { deduplicateSchema } from '~/ir/schema';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import type { SchemaWithType } from '~/plugins';
import type { MaybeTsDsl, TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { createClientOptions } from '../shared/clientOptions';
import { exportType } from '../shared/export';
import { operationToType } from '../shared/operation';
import type { IrSchemaToAstOptions, PluginState } from '../shared/types';
import { webhookToType } from '../shared/webhook';
import type { HeyApiTypeScriptPlugin } from '../types';
import { irSchemaWithTypeToAst } from './toAst';

export const irSchemaToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
}): MaybeTsDsl<TypeTsDsl> => {
  if (schema.symbolRef) {
    return $.type(schema.symbolRef);
  }

  if (schema.$ref) {
    const symbol = plugin.referenceSymbol({
      category: 'type',
      resource: 'definition',
      resourceId: schema.$ref,
    });
    return $.type(symbol);
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
      const itemTypes = schema.items.map((item) =>
        irSchemaToAst({ plugin, schema: item, state }),
      );
      return schema.logicalOperator === 'and'
        ? $.type.and(...itemTypes)
        : $.type.or(...itemTypes);
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
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
}) => {
  const type = irSchemaToAst({ plugin, schema, state });
  exportType({
    plugin,
    schema,
    state,
    type,
  });
};

export const handlerV1: HeyApiTypeScriptPlugin['Handler'] = ({ plugin }) => {
  // reserve node for ClientOptions
  const nodeClientIndex = plugin.node(null);
  // reserve node for Webhooks
  const nodeWebhooksIndex = plugin.node(null);

  const servers: Array<IR.ServerObject> = [];
  const webhooks: Array<Symbol> = [];

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'server',
    'webhook',
    (event) => {
      const state = refs<PluginState>({
        path: event._path,
        tags: event.tags,
      });
      switch (event.type) {
        case 'operation':
          operationToType({
            operation: event.operation,
            plugin,
            state,
          });
          break;
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
        case 'server':
          servers.push(event.server);
          break;
        case 'webhook':
          webhooks.push(
            webhookToType({
              operation: event.operation,
              plugin,
              state,
            }),
          );
          break;
      }
    },
    {
      order: 'declarations',
    },
  );

  createClientOptions({ nodeIndex: nodeClientIndex, plugin, servers });

  if (webhooks.length > 0) {
    const symbol = plugin.symbol(
      buildName({
        config: {
          case: plugin.config.case,
        },
        name: 'Webhooks',
      }),
      {
        meta: {
          category: 'type',
          resource: 'webhook',
          tool: 'typescript',
          variant: 'container',
        },
      },
    );
    const node = $.type
      .alias(symbol)
      .export()
      .type($.type.or(...webhooks));
    plugin.node(node, nodeWebhooksIndex);
  }
};
