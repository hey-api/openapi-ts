import type ts from 'typescript';

import { compiler, type Property } from '../../compiler';
import type { IRContext } from '../../ir/context';
import type {
  IROperationObject,
  IRPathItemObject,
  IRPathsObject,
} from '../../ir/ir';
import { hasParameterGroupObjectRequired } from '../../ir/parameter';
import { operationIrRef } from '../@hey-api/services/plugin';
import type { PluginHandler } from '../types';
import type { Config } from './types';

const fastifyId = 'fastify';

const operationToRouteHandler = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
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

  let errorsTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const identifierErrors = fileTypes.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'errors' }),
    namespace: 'type',
  });
  if (identifierErrors.name) {
    file.import({
      asType: true,
      module: file.relativePathToFile({ context, id: 'types' }),
      name: identifierErrors.name,
    });
    errorsTypeReference = compiler.typeReferenceNode({
      typeName: identifierErrors.name,
    });
  }

  let responsesTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const identifierResponses = fileTypes.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'responses' }),
    namespace: 'type',
  });
  if (identifierResponses.name) {
    file.import({
      asType: true,
      module: file.relativePathToFile({ context, id: 'types' }),
      name: identifierResponses.name,
    });
    responsesTypeReference = compiler.typeReferenceNode({
      typeName: identifierResponses.name,
    });
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

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    id: fastifyId,
    path: plugin.output,
  });

  const routeHandlers: Array<Property> = [];

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const routeHandler = operationToRouteHandler({ context, operation });
      if (routeHandler) {
        routeHandlers.push(routeHandler);
      }
    }
  }

  const identifier = file.identifier({
    $ref: 'RouteHandlers',
    create: true,
    namespace: 'type',
  });
  if (identifier.name) {
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
  }
};
