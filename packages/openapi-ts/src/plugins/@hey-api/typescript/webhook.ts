import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { createSchemaComment } from '../../shared/utils/schema';
import { schemaToType } from './plugin';
import { typesId } from './ref';
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
  const file = plugin.context.file({ id: typesId })!;

  const data: IR.SchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    const name = buildName({
      config: {
        case: plugin.config.webhooks.case,
        name: plugin.config.webhooks.payload,
      },
      name: operation.id,
    });
    const id = plugin.api.getId({ operation, type: 'webhook-payload' });
    const nodeInfo = file.updateNode(id, {
      exported: true,
      name,
    });
    const type = schemaToType({
      onRef: undefined,
      plugin,
      schema: operation.body.schema,
      state,
    });
    const node = tsc.typeAliasDeclaration({
      comment: createSchemaComment({ schema: operation.body.schema }),
      exportType: nodeInfo.exported,
      name: nodeInfo.node,
      type,
    });
    file.add(node);

    data.properties.body = { $ref: id };
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

  const name = buildName({
    config: plugin.config.webhooks,
    name: operation.id,
  });
  const nodeInfo = file.updateNode(
    plugin.api.getId({ operation, type: 'webhook-request' }),
    {
      exported: true,
      name,
    },
  );
  const type = schemaToType({
    onRef: undefined,
    plugin,
    schema: data,
    state,
  });
  const node = tsc.typeAliasDeclaration({
    exportType: nodeInfo.exported,
    name: nodeInfo.node,
    type,
  });
  file.add(node);

  return name;
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

  // const file = plugin.context.file({ id: typesId })!;

  // const { responses } = operationResponsesMap(operation);

  // const response = responses?.properties?.['200'];

  // if (response) {
  //   const name = buildName({
  //     config: {
  //       ...plugin.config.responses,
  //       name: '{{name}}WebhookEvent',
  //     },
  //     name: operation.id,
  //   });
  //   const nodeInfo = file.updateNode(
  //     plugin.api.getId({ operation, type: 'webhook-response' }),
  //     {
  //       exported: true,
  //       name,
  //     },
  //   );
  //   const type = schemaToType({
  //     onRef: undefined,
  //     plugin,
  //     schema: response,
  //     state,
  //   });
  //   const node = tsc.typeAliasDeclaration({
  //     exportType: nodeInfo.exported,
  //     name: nodeInfo.node,
  //     type,
  //   });
  //   file.add(node);
  // }
};
