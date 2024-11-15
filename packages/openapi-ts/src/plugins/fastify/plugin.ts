import ts from 'typescript';

import { compiler, type Property } from '../../compiler';
import type { IRContext } from '../../ir/context';
import type {
  IROperationObject,
  IRParameterObject,
  IRPathItemObject,
  IRPathsObject,
} from '../../ir/ir';
import { irParametersToIrSchema } from '../../ir/schema';
import type { PluginHandler } from '../types';
import {
  componentsToType,
  schemaToType,
  type SchemaToTypeOptions,
} from '../utils/types';
import type { Config } from './types';

const fastifyId = 'fastify';
const ROUTE_HANDLER_NAME = 'RouteHandler';
const OPERATIONS_IDENTIFIER = 'RouteHandlers';
const ROUTE_PROPERTY_NAME = {
  BODY: 'Body',
  HEADER: 'Headers',
  PATH: 'Params',
  QUERY: 'Querystring',
  RESPONSE: 'Reply',
};
const NUMERIC_CODE_REGEX = /\b[0-9]{3}\b/;

const parameterToProperty = ({
  options,
  parameter,
  name,
}: {
  name: string;
  options: SchemaToTypeOptions;
  parameter: Record<string, IRParameterObject>;
}): Property => {
  const schema = irParametersToIrSchema({
    parameters: parameter,
  });
  return {
    isRequired: !!schema.required,
    name,
    type: schemaToType({ options, schema }),
  };
};

const operationToProperty = ({
  operation,
  options,
}: {
  operation: IROperationObject;
  options: SchemaToTypeOptions;
}): Property => {
  const operationProperties: Array<Property> = [];

  if (operation.body) {
    operationProperties.push({
      isRequired: operation.body.required,
      name: ROUTE_PROPERTY_NAME.BODY,
      type: schemaToType({
        options,
        schema: operation.body.schema,
      }),
    });
  }

  if (operation.parameters) {
    if (operation.parameters.header) {
      operationProperties.push(
        parameterToProperty({
          name: ROUTE_PROPERTY_NAME.HEADER,
          options,
          parameter: operation.parameters.header,
        }),
      );
    }

    if (operation.parameters.query) {
      operationProperties.push(
        parameterToProperty({
          name: ROUTE_PROPERTY_NAME.QUERY,
          options,
          parameter: operation.parameters.query,
        }),
      );
    }

    if (operation.parameters.path) {
      operationProperties.push(
        parameterToProperty({
          name: ROUTE_PROPERTY_NAME.PATH,
          options,
          parameter: operation.parameters.path,
        }),
      );
    }
  }

  if (operation.responses) {
    const responseProperties: Array<Property> = [];
    for (const code in operation.responses) {
      if (code === 'default') continue;
      const response = operation.responses[code];
      responseProperties.push({
        name: NUMERIC_CODE_REGEX.test(code)
          ? ts.factory.createNumericLiteral(code)
          : code,
        type: schemaToType({
          options,
          schema: response?.schema ?? {},
        }),
      });
    }
    operationProperties.push({
      name: ROUTE_PROPERTY_NAME.RESPONSE,
      type: compiler.typeInterfaceNode({
        properties: responseProperties,
        useLegacyResolution: false,
      }),
    });
  }

  const operationType = compiler.typeInterfaceNode({
    properties: operationProperties,
    useLegacyResolution: false,
  });
  const property: Property = {
    name: operation.id,
    type: compiler.typeNode(ROUTE_HANDLER_NAME, [operationType]),
  };
  return property;
};

const pathsToType = ({
  context,
  options,
}: {
  context: IRContext;
  options: SchemaToTypeOptions;
}): ts.Node => {
  const operationsProperties = [];
  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];
    for (const method in pathItem) {
      const operation = pathItem[method as keyof IRPathItemObject];
      if (operation) {
        const operationProperty = operationToProperty({ operation, options });
        operationsProperties.push(operationProperty);
      }
    }
  }

  const identifier = context.file({ id: fastifyId })!.identifier({
    $ref: OPERATIONS_IDENTIFIER,
    create: true,
    namespace: 'type',
  });
  const paths = compiler.typeAliasDeclaration({
    exportType: true,
    name: identifier.name || '',
    type: compiler.typeInterfaceNode({
      properties: operationsProperties,
      useLegacyResolution: false,
    }),
  });
  return paths;
};

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    id: fastifyId,
    path: plugin.output,
  });

  const options: SchemaToTypeOptions = { file };
  file.import({ asType: true, module: 'fastify', name: ROUTE_HANDLER_NAME });
  componentsToType({
    context,
    options,
  });
  file.add(pathsToType({ context, options }));
};
