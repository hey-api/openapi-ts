import type { Symbol } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import { createSchemaComment } from '../../../../plugins/shared/utils/schema';
import { $ } from '../../../../ts-dsl';
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
    const symbolWebhookPayload = plugin.symbol(
      applyNaming(operation.id, {
        case: plugin.config.webhooks.case,
        name: plugin.config.webhooks.payload,
      }),
      {
        meta: {
          category: 'type',
          path: fromRef(state.path),
          resource: 'webhook',
          resourceId: operation.id,
          role: 'data',
          tags: fromRef(state.tags),
          tool: 'typescript',
        },
      },
    );
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
    plugin.node(node);

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

  const symbolWebhookRequest = plugin.symbol(
    applyNaming(operation.id, plugin.config.webhooks),
    {
      meta: {
        category: 'type',
        path: fromRef(state.path),
        resource: 'webhook',
        resourceId: operation.id,
        role: 'data',
        tags: fromRef(state.tags),
        tool: 'typescript',
      },
    },
  );
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
  plugin.node(node);

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
