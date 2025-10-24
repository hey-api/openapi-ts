import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';

import type { IrSchemaToAstOptions } from '../shared/types';
import { irSchemaToAst } from './plugin';

export const irWebhookToAst = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}) => {
  if (plugin.config.webhooks.enabled) {
    const requiredProperties = new Set<string>();

    const schemaData: IR.SchemaObject = {
      properties: {
        body: {
          type: 'never',
        },
        path: {
          type: 'never',
        },
        query: {
          type: 'never',
        },
      },
      type: 'object',
    };

    if (operation.parameters) {
      // TODO: add support for cookies

      if (operation.parameters.header) {
        const properties: Record<string, IR.SchemaObject> = {};
        const required: Array<string> = [];

        for (const key in operation.parameters.header) {
          const parameter = operation.parameters.header[key]!;
          properties[parameter.name] = parameter.schema;
          if (parameter.required) {
            required.push(parameter.name);
            requiredProperties.add('headers');
          }
        }

        if (Object.keys(properties).length) {
          schemaData.properties!.headers = {
            properties,
            required,
            type: 'object',
          };
        }
      }

      if (operation.parameters.path) {
        const properties: Record<string, IR.SchemaObject> = {};
        const required: Array<string> = [];

        for (const key in operation.parameters.path) {
          const parameter = operation.parameters.path[key]!;
          properties[parameter.name] = parameter.schema;
          if (parameter.required) {
            required.push(parameter.name);
            requiredProperties.add('path');
          }
        }

        if (Object.keys(properties).length) {
          schemaData.properties!.path = {
            properties,
            required,
            type: 'object',
          };
        }
      }

      if (operation.parameters.query) {
        const properties: Record<string, IR.SchemaObject> = {};
        const required: Array<string> = [];

        for (const key in operation.parameters.query) {
          const parameter = operation.parameters.query[key]!;
          properties[parameter.name] = parameter.schema;
          if (parameter.required) {
            required.push(parameter.name);
            requiredProperties.add('query');
          }
        }

        if (Object.keys(properties).length) {
          schemaData.properties!.query = {
            properties,
            required,
            type: 'object',
          };
        }
      }
    }

    if (operation.body) {
      schemaData.properties!.body = operation.body.schema;

      if (operation.body.required) {
        requiredProperties.add('body');
      }
    }

    schemaData.required = [...requiredProperties];

    const symbol = plugin.registerSymbol({
      exported: true,
      meta: {
        path: state.path.value,
      },
      name: buildName({
        config: plugin.config.webhooks,
        name: operation.id,
      }),
      selector: plugin.api.selector('webhook-request', operation.id),
    });
    irSchemaToAst({
      plugin,
      schema: schemaData,
      state,
      symbol,
    });
  }
};
