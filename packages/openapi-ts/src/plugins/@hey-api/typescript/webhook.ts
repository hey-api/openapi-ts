import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { createSchemaComment } from '../../shared/utils/schema';
import { schemaToType } from './plugin';
import type { HeyApiTypeScriptPlugin } from './types';

const operationToDataType = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
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
      meta: {
        kind: 'type',
      },
      name: buildName({
        config: {
          case: plugin.config.webhooks.case,
          name: plugin.config.webhooks.payload,
        },
        name: operation.id,
      }),
      selector: plugin.api.getSelector('webhook-payload', operation.id),
    });
    const type = schemaToType({
      plugin,
      schema: operation.body.schema,
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
      meta: {
        kind: 'type',
      },
      name: symbolWebhookPayload.name,
      placeholder: symbolWebhookPayload.placeholder,
      selector: plugin.api.getSelector('ref', symbolWebhookPayload.placeholder),
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
    meta: {
      kind: 'type',
    },
    name: buildName({
      config: plugin.config.webhooks,
      name: operation.id,
    }),
    selector: plugin.api.getSelector('webhook-request', operation.id),
  });
  const type = schemaToType({
    plugin,
    schema: data,
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
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
}): string => {
  const name = operationToDataType({ operation, plugin });
  return name;

  // don't handle webhook responses for now, users only need requestBody
};
