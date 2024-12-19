import type ts from 'typescript';

import { compiler, type Property } from '../../compiler';
import { operationResponsesMap } from '../../ir/operation';
import { hasParameterGroupObjectRequired } from '../../ir/parameter';
import type { IR } from '../../ir/types';
import { operationIrRef } from '../shared/utils/ref';
import type { Plugin } from '../types';
import type { Config } from './types';

const fastifyId = 'fastify';

const operationToRouteHandler = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}): Property | undefined => {
  const file = context.file({ id: fastifyId })!;
  const fileTypes = context.file({ id: 'types' })!;

  const properties: Array<Property> = [];

  const identifierData = fileTypes.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'data' }),
    namespace: 'type',
  });
  if (identifierData.name) {
    if (operation.body) {
      file.import({
        asType: true,
        module: file.relativePathToFile({ context, id: 'types' }),
        name: identifierData.name,
      });
      properties.push({
        isRequired: operation.body.required,
        name: 'Body',
        type: `${identifierData.name}['body']`,
      });
    }

    if (operation.parameters) {
      if (operation.parameters.header) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierData.name,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.header,
          ),
          name: 'Headers',
          type: `${identifierData.name}['headers']`,
        });
      }

      if (operation.parameters.path) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierData.name,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.path,
          ),
          name: 'Params',
          type: `${identifierData.name}['path']`,
        });
      }

      if (operation.parameters.query) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierData.name,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.query,
          ),
          name: 'Querystring',
          type: `${identifierData.name}['query']`,
        });
      }
    }
  }

  const { errors, responses } = operationResponsesMap(operation);

  let errorsTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const identifierErrors = fileTypes.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'errors' }),
    namespace: 'type',
  });
  if (identifierErrors.name && errors && errors.properties) {
    const keys = Object.keys(errors.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierErrors.name,
        });
        errorsTypeReference = compiler.typeReferenceNode({
          typeName: identifierErrors.name,
        });
      } else if (keys.length > 1) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierErrors.name,
        });
        const errorsType = compiler.typeReferenceNode({
          typeName: identifierErrors.name,
        });
        const defaultType = compiler.literalTypeNode({
          literal: compiler.stringLiteral({ text: 'default' }),
        });
        errorsTypeReference = compiler.typeReferenceNode({
          typeArguments: [errorsType, defaultType],
          typeName: 'Omit',
        });
      }
    }
  }

  let responsesTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const identifierResponses = fileTypes.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'responses' }),
    namespace: 'type',
  });
  if (identifierResponses.name && responses && responses.properties) {
    const keys = Object.keys(responses.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierResponses.name,
        });
        responsesTypeReference = compiler.typeReferenceNode({
          typeName: identifierResponses.name,
        });
      } else if (keys.length > 1) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierResponses.name,
        });
        const responsesType = compiler.typeReferenceNode({
          typeName: identifierResponses.name,
        });
        const defaultType = compiler.literalTypeNode({
          literal: compiler.stringLiteral({ text: 'default' }),
        });
        responsesTypeReference = compiler.typeReferenceNode({
          typeArguments: [responsesType, defaultType],
          typeName: 'Omit',
        });
      }
    }
  }

  const replyTypes = [errorsTypeReference, responsesTypeReference].filter(
    Boolean,
  );
  if (replyTypes.length) {
    properties.push({
      name: 'Reply',
      type: compiler.typeIntersectionNode({
        types: replyTypes,
      }),
    });
  }

  if (!properties.length) {
    return;
  }

  const routeHandler: Property = {
    name: operation.id,
    type: compiler.typeNode('RouteHandler', [
      compiler.typeInterfaceNode({
        properties,
        useLegacyResolution: false,
      }),
    ]),
  };
  return routeHandler;
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: fastifyId,
    path: plugin.output,
  });

  const routeHandlers: Array<Property> = [];

  context.subscribe('operation', ({ operation }) => {
    const routeHandler = operationToRouteHandler({ context, operation });
    if (routeHandler) {
      routeHandlers.push(routeHandler);
    }
  });

  context.subscribe('after', () => {
    const identifier = file.identifier({
      $ref: 'RouteHandlers',
      create: true,
      namespace: 'type',
    });

    if (!identifier.name) {
      return;
    }

    if (routeHandlers.length) {
      file.import({
        asType: true,
        module: 'fastify',
        name: 'RouteHandler',
      });
    }

    file.add(
      compiler.typeAliasDeclaration({
        exportType: true,
        name: identifier.name,
        type: compiler.typeInterfaceNode({
          properties: routeHandlers,
          useLegacyResolution: false,
        }),
      }),
    );
  });
};
