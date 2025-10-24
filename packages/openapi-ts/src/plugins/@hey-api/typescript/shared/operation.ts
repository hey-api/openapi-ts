import { operationResponsesMap } from '~/ir/operation';
import { deduplicateSchema } from '~/ir/schema';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { tsc } from '~/tsc';

import { irSchemaToAst } from '../v1/plugin';
import type { IrSchemaToAstOptions } from './types';

const irParametersToIrSchema = ({
  parameters,
}: {
  parameters: Record<string, IR.ParameterObject>;
}): IR.SchemaObject => {
  const irSchema: IR.SchemaObject = {
    type: 'object',
  };

  if (parameters) {
    const properties: Record<string, IR.SchemaObject> = {};
    const required: Array<string> = [];

    for (const key in parameters) {
      const parameter = parameters[key]!;

      properties[parameter.name] = deduplicateSchema({
        detectFormat: false,
        schema: parameter.schema,
      });

      if (parameter.required) {
        required.push(parameter.name);
      }
    }

    irSchema.properties = properties;

    if (required.length) {
      irSchema.required = required;
    }
  }

  return irSchema;
};

const operationToDataType = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}) => {
  const data: IR.SchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    data.properties.body = operation.body.schema;

    if (operation.body.required) {
      dataRequired.push('body');
    }
  } else {
    data.properties.body = {
      type: 'never',
    };
  }

  // TODO: parser - handle cookie parameters

  // do not set headers to never so we can always pass arbitrary values
  if (operation.parameters?.header) {
    data.properties.headers = irParametersToIrSchema({
      parameters: operation.parameters.header,
    });

    if (data.properties.headers.required) {
      dataRequired.push('headers');
    }
  }

  if (operation.parameters?.path) {
    data.properties.path = irParametersToIrSchema({
      parameters: operation.parameters.path,
    });

    if (data.properties.path.required) {
      dataRequired.push('path');
    }
  } else {
    data.properties.path = {
      type: 'never',
    };
  }

  if (operation.parameters?.query) {
    data.properties.query = irParametersToIrSchema({
      parameters: operation.parameters.query,
    });

    if (data.properties.query.required) {
      dataRequired.push('query');
    }
  } else {
    data.properties.query = {
      type: 'never',
    };
  }

  data.properties.url = {
    const: operation.path,
    type: 'string',
  };
  dataRequired.push('url');

  data.required = dataRequired;

  const symbol = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
      path: state.path.value,
    },
    name: buildName({
      config: plugin.config.requests,
      name: operation.id,
    }),
    selector: plugin.api.selector('data', operation.id),
  });
  const type = irSchemaToAst({
    plugin,
    schema: data,
    state,
  });
  const node = tsc.typeAliasDeclaration({
    exportType: symbol.exported,
    name: symbol.placeholder,
    type,
  });
  plugin.setSymbolValue(symbol, node);
};

export const operationToType = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}) => {
  operationToDataType({ operation, plugin, state });

  const { error, errors, response, responses } =
    operationResponsesMap(operation);

  if (errors) {
    const symbolErrors = plugin.registerSymbol({
      exported: true,
      meta: {
        kind: 'type',
        path: state.path.value,
      },
      name: buildName({
        config: plugin.config.errors,
        name: operation.id,
      }),
      selector: plugin.api.selector('errors', operation.id),
    });
    const type = irSchemaToAst({
      plugin,
      schema: errors,
      state,
    });
    const node = tsc.typeAliasDeclaration({
      exportType: symbolErrors.exported,
      name: symbolErrors.placeholder,
      type,
    });
    plugin.setSymbolValue(symbolErrors, node);

    if (error) {
      const symbol = plugin.registerSymbol({
        exported: true,
        meta: {
          kind: 'type',
          path: state.path.value,
        },
        name: buildName({
          config: {
            case: plugin.config.errors.case,
            name: plugin.config.errors.error,
          },
          name: operation.id,
        }),
        selector: plugin.api.selector('error', operation.id),
      });
      const type = tsc.indexedAccessTypeNode({
        indexType: tsc.typeOperatorNode({
          operator: 'keyof',
          type: tsc.typeReferenceNode({ typeName: symbolErrors.placeholder }),
        }),
        objectType: tsc.typeReferenceNode({
          typeName: symbolErrors.placeholder,
        }),
      });
      const node = tsc.typeAliasDeclaration({
        exportType: symbol.exported,
        name: symbol.placeholder,
        type,
      });
      plugin.setSymbolValue(symbol, node);
    }
  }

  if (responses) {
    const symbolResponses = plugin.registerSymbol({
      exported: true,
      meta: {
        kind: 'type',
        path: state.path.value,
      },
      name: buildName({
        config: plugin.config.responses,
        name: operation.id,
      }),
      selector: plugin.api.selector('responses', operation.id),
    });
    const type = irSchemaToAst({
      plugin,
      schema: responses,
      state,
    });
    const node = tsc.typeAliasDeclaration({
      exportType: symbolResponses.exported,
      name: symbolResponses.placeholder,
      type,
    });
    plugin.setSymbolValue(symbolResponses, node);

    if (response) {
      const symbol = plugin.registerSymbol({
        exported: true,
        meta: {
          kind: 'type',
          path: state.path.value,
        },
        name: buildName({
          config: {
            case: plugin.config.responses.case,
            name: plugin.config.responses.response,
          },
          name: operation.id,
        }),
        selector: plugin.api.selector('response', operation.id),
      });
      const type = tsc.indexedAccessTypeNode({
        indexType: tsc.typeOperatorNode({
          operator: 'keyof',
          type: tsc.typeReferenceNode({
            typeName: symbolResponses.placeholder,
          }),
        }),
        objectType: tsc.typeReferenceNode({
          typeName: symbolResponses.placeholder,
        }),
      });
      const node = tsc.typeAliasDeclaration({
        exportType: symbol.exported,
        name: symbol.placeholder,
        type,
      });
      plugin.setSymbolValue(symbol, node);
    }
  }
};
