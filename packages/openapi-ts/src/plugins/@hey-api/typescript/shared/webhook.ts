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
}): string => {
  const data: IR.SchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    const symbolWebhookPayload = plugin.registerSymbol({
      exported: true,
      kind: 'type',
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
      .alias(symbolWebhookPayload.placeholder)
      .export(symbolWebhookPayload.exported)
      .$if(createSchemaComment(operation.body.schema), (t, v) => t.doc(v))
      .type(
        irSchemaToAst({
          plugin,
          schema: operation.body.schema,
          state,
        }),
      );
    plugin.setSymbolValue(symbolWebhookPayload, node);

    plugin.registerSymbol({
      exported: true,
      kind: 'type',
      meta: {
        category: 'type',
        path: state.path.value,
        resource: 'definition',
        resourceId: symbolWebhookPayload.placeholder,
        tags: state.tags?.value,
        tool: 'typescript',
      },
      name: symbolWebhookPayload.name,
      placeholder: symbolWebhookPayload.placeholder,
    });
    data.properties.body = { $ref: symbolWebhookPayload.placeholder };
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
    exported: true,
    kind: 'type',
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
    .alias(symbolWebhookRequest.placeholder)
    .export(symbolWebhookRequest.exported)
    .type(
      irSchemaToAst({
        plugin,
        schema: data,
        state,
      }),
    );
  plugin.setSymbolValue(symbolWebhookRequest, node);

  return symbolWebhookRequest.placeholder;
};

export const webhookToType = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}): string => {
  const name = operationToDataType({ operation, plugin, state });
  return name;

  // don't handle webhook responses for now, users only need requestBody
};
