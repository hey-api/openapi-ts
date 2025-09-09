import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { createSchemaComment } from '../../shared/utils/schema';
import { schemaToType } from './plugin';
import type { HeyApiTypeScriptPlugin, PluginState } from './types';

const operationToDataType = ({
  operation,
  plugin,
  state,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  state: PluginState;
}): string => {
  const f = plugin.gen.ensureFile(plugin.output);

  const data: IR.SchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    const symbolWebhookPayload = f
      .ensureSymbol({
        selector: plugin.api.getSelector('webhook-payload', operation.id),
      })
      .update({
        name: buildName({
          config: {
            case: plugin.config.webhooks.case,
            name: plugin.config.webhooks.payload,
          },
          name: operation.id,
        }),
      });
    const type = schemaToType({
      onRef: undefined,
      plugin,
      schema: operation.body.schema,
      state,
    });
    const node = tsc.typeAliasDeclaration({
      comment: createSchemaComment({ schema: operation.body.schema }),
      exportType: true,
      name: symbolWebhookPayload.placeholder,
      type,
    });
    symbolWebhookPayload.update({ value: node });

    f.ensureSymbol({
      selector: plugin.api.getSelector('ref', symbolWebhookPayload.placeholder),
    }).update({
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

  const symbolWebhookRequest = f.addSymbol({
    name: buildName({
      config: plugin.config.webhooks,
      name: operation.id,
    }),
    selector: plugin.api.getSelector('webhook-request', operation.id),
  });
  const type = schemaToType({
    onRef: undefined,
    plugin,
    schema: data,
    state,
  });
  const node = tsc.typeAliasDeclaration({
    exportType: true,
    name: symbolWebhookRequest.placeholder,
    type,
  });
  symbolWebhookRequest.update({ value: node });

  return symbolWebhookRequest.placeholder;
};

export const webhookToType = ({
  operation,
  plugin,
  state,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  state: PluginState;
}): string => {
  const name = operationToDataType({ operation, plugin, state });
  return name;

  // don't handle webhook responses for now, users only need requestBody
};
