import type { IR } from '../../ir/types';
import { buildName } from '../../openApi/shared/utils/name';
import { schemaToValibotSchema, type State } from './plugin';
import type { ValibotPlugin } from './types';

export const webhookToValibotSchema = ({
  operation,
  plugin,
  state,
}: {
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
  state: State;
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

    const selector = plugin.api.getSelector('webhook-request', operation.id);
    const name = buildName({
      config: plugin.config.webhooks,
      name: operation.id,
    });
    const f = plugin.gen.ensureFile(plugin.output);
    const symbol = f.addSymbol({ name, selector });
    schemaToValibotSchema({
      // TODO: refactor for better cross-plugin compatibility
      $ref: `#/valibot-webhook/${operation.id}`,
      plugin,
      schema: schemaData,
      state,
      symbol,
    });
  }
};
