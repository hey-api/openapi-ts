import { operationResponsesMap } from '../../../ir/operation';
import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { schemaToType } from './plugin';
import type { HeyApiTypeScriptPlugin, PluginState } from './types';

// TODO: exported just for @pinia/colada, remove export once that plugin does not depend on it
export const irParametersToIrSchema = ({
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
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  state: PluginState;
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

  const f = plugin.gen.ensureFile(plugin.output);
  const symbol = f.addSymbol({
    name: buildName({
      config: plugin.config.requests,
      name: operation.id,
    }),
    selector: plugin.api.getSelector('data', operation.id),
  });
  const type = schemaToType({
    onRef: undefined,
    plugin,
    schema: data,
    state,
  });
  const node = tsc.typeAliasDeclaration({
    exportType: true,
    name: symbol.placeholder,
    type,
  });
  symbol.update({ value: node });
};

export const operationToType = ({
  operation,
  plugin,
  state,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  state: PluginState;
}) => {
  operationToDataType({ operation, plugin, state });

  const f = plugin.gen.ensureFile(plugin.output);

  const { error, errors, response, responses } =
    operationResponsesMap(operation);

  if (errors) {
    const symbolErrors = f.addSymbol({
      name: buildName({
        config: plugin.config.errors,
        name: operation.id,
      }),
      selector: plugin.api.getSelector('errors', operation.id),
    });
    const type = schemaToType({
      onRef: undefined,
      plugin,
      schema: errors,
      state,
    });
    const node = tsc.typeAliasDeclaration({
      exportType: true,
      name: symbolErrors.placeholder,
      type,
    });
    symbolErrors.update({ value: node });

    if (error) {
      const symbol = f.addSymbol({
        name: buildName({
          config: {
            case: plugin.config.errors.case,
            name: plugin.config.errors.error,
          },
          name: operation.id,
        }),
        selector: plugin.api.getSelector('error', operation.id),
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
        exportType: true,
        name: symbol.placeholder,
        type,
      });
      symbol.update({ value: node });
    }
  }

  if (responses) {
    const symbolResponses = f.addSymbol({
      name: buildName({
        config: plugin.config.responses,
        name: operation.id,
      }),
      selector: plugin.api.getSelector('responses', operation.id),
    });
    const type = schemaToType({
      onRef: undefined,
      plugin,
      schema: responses,
      state,
    });
    const node = tsc.typeAliasDeclaration({
      exportType: true,
      name: symbolResponses.placeholder,
      type,
    });
    symbolResponses.update({ value: node });

    if (response) {
      const symbol = f.addSymbol({
        name: buildName({
          config: {
            case: plugin.config.responses.case,
            name: plugin.config.responses.response,
          },
          name: operation.id,
        }),
        selector: plugin.api.getSelector('response', operation.id),
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
        exportType: true,
        name: symbol.placeholder,
        type,
      });
      symbol.update({ value: node });
    }
  }
};
