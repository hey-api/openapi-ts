import { operationResponsesMap } from '../../ir/operation';
import type { IR } from '../../ir/types';
import { buildName } from '../../openApi/shared/utils/name';
import { pathToSymbolResourceType } from '../shared/utils/meta';
import { schemaToValibotSchema, type State } from './plugin';
import type { ValibotPlugin } from './types';

export const operationToValibotSchema = ({
  _path,
  operation,
  plugin,
  state,
}: {
  _path: ReadonlyArray<string | number>;
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
  state: State;
}) => {
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

    const symbol = plugin.registerSymbol({
      exported: true,
      meta: {
        resourceType: pathToSymbolResourceType(_path),
      },
      name: buildName({
        config: plugin.config.requests,
        name: operation.id,
      }),
      selector: plugin.api.getSelector('data', operation.id),
    });
    schemaToValibotSchema({
      _path,
      plugin,
      schema: schemaData,
      state,
      symbol,
    });
  }

  if (plugin.config.responses.enabled) {
    if (operation.responses) {
      const { response } = operationResponsesMap(operation);

      if (response) {
        const path = [..._path, 'responses'];
        const symbol = plugin.registerSymbol({
          exported: true,
          meta: {
            resourceType: pathToSymbolResourceType(path),
          },
          name: buildName({
            config: plugin.config.responses,
            name: operation.id,
          }),
          selector: plugin.api.getSelector('responses', operation.id),
        });
        schemaToValibotSchema({
          _path: path,
          plugin,
          schema: response,
          state,
          symbol,
        });
      }
    }
  }
};
