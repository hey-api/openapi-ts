import { operationResponsesMap } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { pathToSymbolResourceType } from '../../shared/utils/meta';
import { exportAst } from './export';
import type { Ast, IrSchemaToAstOptions } from './types';

export const irOperationToAst = ({
  getAst,
  operation,
  plugin,
  state,
}: Omit<IrSchemaToAstOptions, 'state'> & {
  getAst: (
    schema: IR.SchemaObject,
    path: ReadonlyArray<string | number>,
  ) => Ast;
  operation: IR.OperationObject;
  state: Partial<IrSchemaToAstOptions['state']>;
}): void => {
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

    const path = state._path?.value || [];
    const ast = getAst(schemaData, path);
    const resourceType = pathToSymbolResourceType(path);
    const symbol = plugin.registerSymbol({
      exported: true,
      meta: {
        resourceType,
      },
      name: buildName({
        config: plugin.config.requests,
        name: operation.id,
      }),
      selector: plugin.api.selector('data', operation.id),
    });
    const typeInferSymbol = plugin.config.requests.types.infer.enabled
      ? plugin.registerSymbol({
          exported: true,
          meta: {
            kind: 'type',
            resourceType,
          },
          name: buildName({
            config: plugin.config.requests.types.infer,
            name: operation.id,
          }),
          selector: plugin.api.selector('type-infer-data', operation.id),
        })
      : undefined;
    exportAst({
      ast,
      plugin,
      schema: schemaData,
      symbol,
      typeInferSymbol,
    });
  }

  if (plugin.config.responses.enabled) {
    if (operation.responses) {
      const { response } = operationResponsesMap(operation);

      if (response) {
        const path = [...(state._path?.value || []), 'responses'];
        const ast = getAst(response, path);
        const resourceType = pathToSymbolResourceType(path);
        const symbol = plugin.registerSymbol({
          exported: true,
          meta: {
            resourceType,
          },
          name: buildName({
            config: plugin.config.responses,
            name: operation.id,
          }),
          selector: plugin.api.selector('responses', operation.id),
        });
        const typeInferSymbol = plugin.config.responses.types.infer.enabled
          ? plugin.registerSymbol({
              exported: true,
              meta: {
                kind: 'type',
                resourceType,
              },
              name: buildName({
                config: plugin.config.responses.types.infer,
                name: operation.id,
              }),
              selector: plugin.api.selector(
                'type-infer-responses',
                operation.id,
              ),
            })
          : undefined;
        exportAst({
          ast,
          plugin,
          schema: response,
          symbol,
          typeInferSymbol,
        });
      }
    }
  }
};
