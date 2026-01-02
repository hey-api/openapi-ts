import type { Symbol } from '@hey-api/codegen-core';
import { refs } from '@hey-api/codegen-core';

import { deduplicateSchema } from '~/ir/schema';
import type { IR } from '~/ir/types';
import type { SchemaWithType } from '~/plugins';
import type { MaybeTsDsl, TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';
import { applyNaming } from '~/utils/naming';

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
    const baseType = $.type(schema.symbolRef);
    if (schema.omit && schema.omit.length > 0) {
      // Render as Omit<Type, 'prop1' | 'prop2'>
      const omittedKeys =
        schema.omit.length === 1
          ? $.type.literal(schema.omit[0]!)
          : $.type.or(...schema.omit.map((key) => $.type.literal(key)));
      return $.type('Omit').generics(baseType, omittedKeys);
    }
    return baseType;
  }

  if (schema.$ref) {
    const symbol = plugin.referenceSymbol({
      category: 'type',
      resource: 'definition',
      resourceId: schema.$ref,
    });
    const baseType = $.type(symbol);
    if (schema.omit && schema.omit.length > 0) {
      // Render as Omit<Type, 'prop1' | 'prop2'>
      const omittedKeys =
        schema.omit.length === 1
          ? $.type.literal(schema.omit[0]!)
          : $.type.or(...schema.omit.map((key) => $.type.literal(key)));
      return $.type('Omit').generics(baseType, omittedKeys);
    }
    return baseType;
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
      applyNaming('Webhooks', {
        case: plugin.config.case,
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
