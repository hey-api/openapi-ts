import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { $ } from '~/ts-dsl';

import { irSchemaToAst } from '../v1/plugin';
import type { IrSchemaToAstOptions } from './types';

const operationToDataType = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}): Symbol => {
  const data: IR.SchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    const symbolWebhookPayload = plugin.registerSymbol({
      meta: {
        category: 'type',
        path: state.path.value,
        resource: 'webhook',
        resourceId: operation.id,
        role: 'data',
        tags: state.tags?.value,
        tool: 'typescript',
      },
      name: buildName({
        config: {
          case: plugin.config.webhooks.case,
          name: plugin.config.webhooks.payload,
        },
        name: operation.id,
      }),
    });
    const node = $.type
      .alias(symbolWebhookPayload)
      .export()
      .$if(createSchemaComment(operation.body.schema), (t, v) => t.doc(v))
      .type(
        irSchemaToAst({
          plugin,
          schema: operation.body.schema,
          state,
        }),
      );
    plugin.addNode(node);

    data.properties.body = { symbolRef: symbolWebhookPayload };
    dataRequired.push('body');
  } else {
    data.properties.body = { type: 'never' };
  }

  data.properties.key = {
    const: operation.path,
    type: 'string',
  };
  dataRequired.push('key');

  data.properties.path = { type: 'never' };
  data.properties.query = { type: 'never' };

  data.required = dataRequired;

  const symbolWebhookRequest = plugin.registerSymbol({
    meta: {
      category: 'type',
      path: state.path.value,
      resource: 'webhook',
      resourceId: operation.id,
      role: 'data',
      tags: state.tags?.value,
      tool: 'typescript',
    },
    name: buildName({
      config: plugin.config.webhooks,
      name: operation.id,
    }),
  });
  const node = $.type
    .alias(symbolWebhookRequest)
    .export()
    .type(
      irSchemaToAst({
        plugin,
        schema: data,
        state,
      }),
    );
  plugin.addNode(node);

  return symbolWebhookRequest;
};

export const webhookToType = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}): Symbol => {
  const symbol = operationToDataType({ operation, plugin, state });
  return symbol;

  // don't handle webhook responses for now, users only need requestBody
};
