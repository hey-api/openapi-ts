import ts from 'typescript';

import { compiler } from '../../../compiler';
import type { IRContext } from '../../../ir/context';
import type {
  IROperationObject,
  IRParameterObject,
  IRPathItemObject,
  IRPathsObject,
  IRSchemaObject,
} from '../../../ir/ir';
import { operationResponsesMap } from '../../../ir/operation';
import { deduplicateSchema } from '../../../ir/schema';
import type { PluginHandler } from '../../types';
import { schemaToType, type SchemaToTypeOptions } from '../../utils/types';
import { operationIrRef } from '../services/plugin';
import type { Config } from './types';

export const typesId = 'types';

const irParametersToIrSchema = ({
  parameters,
}: {
  parameters: Record<string, IRParameterObject>;
}): IRSchemaObject => {
  const irSchema: IRSchemaObject = {
    type: 'object',
  };

  if (parameters) {
    const properties: Record<string, IRSchemaObject> = {};
    const required: Array<string> = [];

    for (const name in parameters) {
      const parameter = parameters[name];

      properties[name] = deduplicateSchema({
        schema: parameter.schema,
      });

      if (parameter.required) {
        required.push(name);
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
  context,
  operation,
  options,
}: {
  context: IRContext;
  operation: IROperationObject;
  options: SchemaToTypeOptions;
}) => {
  const data: IRSchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];
  let hasAnyProperties = false;

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    hasAnyProperties = true;
    data.properties.body = operation.body.schema;

    if (operation.body.required) {
      dataRequired.push('body');
    }
  } else {
    data.properties.body = {
      type: 'never',
    };
  }

  if (operation.parameters) {
    // TODO: parser - handle cookie parameters

    // do not set headers to never so we can always pass arbitrary values
    if (operation.parameters.header) {
      hasAnyProperties = true;
      data.properties.headers = irParametersToIrSchema({
        parameters: operation.parameters.header,
      });

      if (data.properties.headers.required) {
        dataRequired.push('headers');
      }
    }

    if (operation.parameters.path) {
      hasAnyProperties = true;
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

    if (operation.parameters.query) {
      hasAnyProperties = true;
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
  }

  data.required = dataRequired;

  if (hasAnyProperties) {
    const identifier = context.file({ id: typesId })!.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'data' }),
      create: true,
      namespace: 'type',
    });
    const node = compiler.typeAliasDeclaration({
      exportType: true,
      name: identifier.name || '',
      type: schemaToType({
        options,
        schema: data,
      }),
    });
    context.file({ id: typesId })!.add(node);
  }
};

const operationToType = ({
  context,
  operation,
  options,
}: {
  context: IRContext;
  operation: IROperationObject;
  options: SchemaToTypeOptions;
}) => {
  operationToDataType({
    context,
    operation,
    options,
  });

  const file = context.file({ id: typesId })!;

  const { error, errors, response, responses } =
    operationResponsesMap(operation);

  if (errors) {
    const identifierErrors = file.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'errors' }),
      create: true,
      namespace: 'type',
    });
    if (identifierErrors.name) {
      const node = compiler.typeAliasDeclaration({
        exportType: true,
        name: identifierErrors.name,
        type: schemaToType({
          options,
          schema: errors,
        }),
      });
      file.add(node);

      if (error) {
        const identifierError = file.identifier({
          $ref: operationIrRef({ id: operation.id, type: 'error' }),
          create: true,
          namespace: 'type',
        });
        if (identifierError.name) {
          const errorsType = compiler.typeReferenceNode({
            typeName: identifierErrors.name,
          });
          const keyofType = ts.factory.createTypeOperatorNode(
            ts.SyntaxKind.KeyOfKeyword,
            errorsType,
          );
          const node = compiler.typeAliasDeclaration({
            exportType: true,
            name: identifierError.name,
            type: compiler.indexedAccessTypeNode({
              indexType: keyofType,
              objectType: errorsType,
            }),
          });
          file.add(node);
        }
      }
    }
  }

  if (responses) {
    const identifierResponses = file.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'responses' }),
      create: true,
      namespace: 'type',
    });
    if (identifierResponses.name) {
      const node = compiler.typeAliasDeclaration({
        exportType: true,
        name: identifierResponses.name,
        type: schemaToType({
          options,
          schema: responses,
        }),
      });
      file.add(node);

      if (response) {
        const identifierResponse = file.identifier({
          $ref: operationIrRef({ id: operation.id, type: 'response' }),
          create: true,
          namespace: 'type',
        });
        if (identifierResponse.name) {
          const responsesType = compiler.typeReferenceNode({
            typeName: identifierResponses.name,
          });
          const keyofType = ts.factory.createTypeOperatorNode(
            ts.SyntaxKind.KeyOfKeyword,
            responsesType,
          );
          const node = compiler.typeAliasDeclaration({
            exportType: true,
            name: identifierResponse.name,
            type: compiler.indexedAccessTypeNode({
              indexType: keyofType,
              objectType: responsesType,
            }),
          });
          file.add(node);
        }
      }
    }
  }
};

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    id: typesId,
    path: plugin.output,
  });
  const options: SchemaToTypeOptions = {
    enums: context.config.plugins['@hey-api/types']?.enums,
    file,
    useTransformersDate: context.config.plugins['@hey-api/transformers']?.dates,
  };

  if (context.ir.components) {
    for (const name in context.ir.components.schemas) {
      const schema = context.ir.components.schemas[name];
      const $ref = `#/components/schemas/${name}`;

      schemaToType({
        $ref,
        options,
        schema,
      });
    }

    for (const name in context.ir.components.parameters) {
      const parameter = context.ir.components.parameters[name];
      const $ref = `#/components/parameters/${name}`;

      schemaToType({
        $ref,
        options,
        schema: parameter.schema,
      });
    }
  }

  // TODO: parser - once types are a plugin, this logic can be simplified
  // provide config option on types to generate path types and services
  // will set it to true if needed
  if (
    context.config.plugins['@hey-api/services'] ||
    context.config.plugins['@hey-api/types']?.tree
  ) {
    for (const path in context.ir.paths) {
      const pathItem = context.ir.paths[path as keyof IRPathsObject];

      for (const _method in pathItem) {
        const method = _method as keyof IRPathItemObject;
        const operation = pathItem[method]!;

        operationToType({
          context,
          operation,
          options,
        });
      }
    }

    // TODO: parser - document removal of tree? migrate it?
  }
};
