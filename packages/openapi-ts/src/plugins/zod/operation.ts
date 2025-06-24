import { operationResponsesMap } from '../../ir/operation';
import type { IR } from '../../ir/types';
import { zodId } from './constants';
import type { State } from './plugin';
import { schemaToZodSchema } from './plugin';
import type { ZodPlugin } from './types';

export const operationToZodSchema = ({
  operation,
  plugin,
  state,
}: {
  operation: IR.OperationObject;
  plugin: ZodPlugin['Instance'];
  state: State;
}) => {
  const file = plugin.context.file({ id: zodId })!;

  if (plugin.config.requests.enabled) {
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

    const identifierData = file.identifier({
      // TODO: refactor for better cross-plugin compatibility
      $ref: `#/zod-data/${operation.id}`,
      case: plugin.config.requests.case,
      create: true,
      nameTransformer: plugin.config.requests.name,
      namespace: 'value',
    });
    schemaToZodSchema({
      // TODO: refactor for better cross-plugin compatibility
      $ref: `#/zod-data/${operation.id}`,
      identifier: identifierData,
      plugin,
      schema: schemaData,
      state,
    });
  }

  if (plugin.config.responses.enabled) {
    if (operation.responses) {
      const { response } = operationResponsesMap(operation);

      if (response) {
        const identifierResponse = file.identifier({
          // TODO: refactor for better cross-plugin compatibility
          $ref: `#/zod-response/${operation.id}`,
          case: plugin.config.responses.case,
          create: true,
          nameTransformer: plugin.config.responses.name,
          namespace: 'value',
        });
        schemaToZodSchema({
          // TODO: refactor for better cross-plugin compatibility
          $ref: `#/zod-response/${operation.id}`,
          identifier: identifierResponse,
          plugin,
          schema: response,
          state,
        });
      }
    }
  }
};
