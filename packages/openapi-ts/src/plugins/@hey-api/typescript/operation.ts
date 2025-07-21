import ts from 'typescript';

import { compiler } from '../../../compiler';
import { operationResponsesMap } from '../../../ir/operation';
import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { schemaToType } from './plugin';
import { typesId } from './ref';
import type { HeyApiTypeScriptPlugin } from './types';

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
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
}) => {
  const file = plugin.context.file({ id: typesId })!;
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

  const name = buildName({
    config: plugin.config.requests,
    name: operation.id,
  });
  const nodeInfo = file.updateNode(
    plugin.api.getId({ operation, type: 'data' }),
    {
      exported: true,
      name,
    },
  );
  const type = schemaToType({
    onRef: undefined,
    plugin,
    schema: data,
  });
  const node = compiler.typeAliasDeclaration({
    exportType: nodeInfo.exported,
    name: nodeInfo.node,
    type,
  });
  file.add(node);
};

export const operationToType = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
}) => {
  operationToDataType({ operation, plugin });

  const file = plugin.context.file({ id: typesId })!;

  const { error, errors, response, responses } =
    operationResponsesMap(operation);

  if (errors) {
    const name = buildName({
      config: plugin.config.errors,
      name: operation.id,
    });
    const nodeInfo = file.updateNode(
      plugin.api.getId({ operation, type: 'errors' }),
      {
        exported: true,
        name,
      },
    );
    const type = schemaToType({
      onRef: undefined,
      plugin,
      schema: errors,
    });
    const node = compiler.typeAliasDeclaration({
      exportType: nodeInfo.exported,
      name: nodeInfo.node,
      type,
    });
    file.add(node);

    if (error) {
      const name = buildName({
        config: {
          case: plugin.config.errors.case,
          name: plugin.config.errors.error,
        },
        name: operation.id,
      });
      const errorNodeInfo = file.updateNode(
        plugin.api.getId({ operation, type: 'error' }),
        {
          exported: true,
          name,
        },
      );
      const type = compiler.indexedAccessTypeNode({
        indexType: ts.factory.createTypeOperatorNode(
          ts.SyntaxKind.KeyOfKeyword,
          nodeInfo.node,
        ),
        objectType: nodeInfo.node,
      });
      const node = compiler.typeAliasDeclaration({
        exportType: errorNodeInfo.exported,
        name: errorNodeInfo.node,
        type,
      });
      file.add(node);
    }
  }

  if (responses) {
    const name = buildName({
      config: plugin.config.responses,
      name: operation.id,
    });
    const nodeInfo = file.updateNode(
      plugin.api.getId({ operation, type: 'responses' }),
      {
        exported: true,
        name,
      },
    );
    const type = schemaToType({
      onRef: undefined,
      plugin,
      schema: responses,
    });
    const node = compiler.typeAliasDeclaration({
      exportType: nodeInfo.exported,
      name: nodeInfo.node,
      type,
    });
    file.add(node);

    if (response) {
      const name = buildName({
        config: {
          case: plugin.config.responses.case,
          name: plugin.config.responses.response,
        },
        name: operation.id,
      });
      const responseNodeInfo = file.updateNode(
        plugin.api.getId({ operation, type: 'response' }),
        {
          exported: true,
          name,
        },
      );
      const type = compiler.indexedAccessTypeNode({
        indexType: ts.factory.createTypeOperatorNode(
          ts.SyntaxKind.KeyOfKeyword,
          nodeInfo.node,
        ),
        objectType: nodeInfo.node,
      });
      const node = compiler.typeAliasDeclaration({
        exportType: responseNodeInfo.exported,
        name: responseNodeInfo.node,
        type,
      });
      file.add(node);
    }
  }
};
