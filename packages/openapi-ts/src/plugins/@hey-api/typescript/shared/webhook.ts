import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { tsc } from '~/tsc';

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
        path: state.path.value,
        tags: state.tags?.value,
      },
      name: buildName({
        config: {
          case: plugin.config.webhooks.case,
          name: plugin.config.webhooks.payload,
        },
        name: operation.id,
      }),
      selector: plugin.api.selector('webhook-payload', operation.id),
    });
    const type = irSchemaToAst({
      plugin,
      schema: operation.body.schema,
      state,
    });
    const node = tsc.typeAliasDeclaration({
      comment: createSchemaComment({ schema: operation.body.schema }),
      exportType: symbolWebhookPayload.exported,
      name: symbolWebhookPayload.placeholder,
      type,
    });
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
      path: state.path.value,
      tags: state.tags?.value,
    },
    name: buildName({
      config: plugin.config.webhooks,
      name: operation.id,
    }),
    selector: plugin.api.selector('webhook-request', operation.id),
  });
  const type = irSchemaToAst({
    plugin,
    schema: data,
    state,
  });
  const node = tsc.typeAliasDeclaration({
    exportType: symbolWebhookRequest.exported,
    name: symbolWebhookRequest.placeholder,
    type,
  });
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
