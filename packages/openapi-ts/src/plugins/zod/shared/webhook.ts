import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';

import { exportAst } from './export';
import type { Ast, IrSchemaToAstOptions } from './types';

export const irWebhookToAst = ({
  getAst,
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  getAst: (
    schema: IR.SchemaObject,
    path: ReadonlyArray<string | number>,
  ) => Ast;
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

    const ast = getAst(schemaData, state.path.value);
    const symbol = plugin.registerSymbol({
      exported: true,
      meta: {
        category: 'schema',
        path: state.path.value,
        resource: 'webhook',
        resourceId: operation.id,
        role: 'data',
        tags: state.tags?.value,
        tool: 'zod',
      },
      name: buildName({
        config: plugin.config.webhooks,
        name: operation.id,
      }),
    });
    const typeInferSymbol = plugin.config.webhooks.types.infer.enabled
      ? plugin.registerSymbol({
          exported: true,
          kind: 'type',
          meta: {
            category: 'type',
            path: state.path.value,
            resource: 'webhook',
            resourceId: operation.id,
            role: 'data',
            tags: state.tags?.value,
            tool: 'zod',
            variant: 'infer',
          },
          name: buildName({
            config: plugin.config.webhooks.types.infer,
            name: operation.id,
          }),
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
};
