import type ts from 'typescript';

import { operationResponsesMap } from '../../ir/operation';
import { hasParameterGroupObjectRequired } from '../../ir/parameter';
import type { IR } from '../../ir/types';
import { type Property, tsc } from '../../tsc';
import { typesId } from '../@hey-api/typescript/ref';
import type { FastifyPlugin } from './types';

const fastifyId = 'fastify';

const operationToRouteHandler = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: FastifyPlugin['Instance'];
}): Property | undefined => {
  const file = plugin.context.file({ id: fastifyId })!;

  const properties: Array<Property> = [];

  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const dataName = fileTypeScript.getName(
    pluginTypeScript.api.getId({ operation, type: 'data' }),
  );
  if (dataName) {
    if (operation.body) {
      file.import({
        asType: true,
        module: file.relativePathToFile({
          context: plugin.context,
          id: typesId,
        }),
        name: dataName,
      });
      properties.push({
        isRequired: operation.body.required,
        name: 'Body',
        type: `${dataName}['body']`,
      });
    }

    if (operation.parameters) {
      if (operation.parameters.header) {
        file.import({
          asType: true,
          module: file.relativePathToFile({
            context: plugin.context,
            id: typesId,
          }),
          name: dataName,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.header,
          ),
          name: 'Headers',
          type: `${dataName}['headers']`,
        });
      }

      if (operation.parameters.path) {
        file.import({
          asType: true,
          module: file.relativePathToFile({
            context: plugin.context,
            id: typesId,
          }),
          name: dataName,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.path,
          ),
          name: 'Params',
          type: `${dataName}['path']`,
        });
      }

      if (operation.parameters.query) {
        file.import({
          asType: true,
          module: file.relativePathToFile({
            context: plugin.context,
            id: typesId,
          }),
          name: dataName,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.query,
          ),
          name: 'Querystring',
          type: `${dataName}['query']`,
        });
      }
    }
  }

  const { errors, responses } = operationResponsesMap(operation);

  let errorsTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const errorName = fileTypeScript.getName(
    pluginTypeScript.api.getId({ operation, type: 'errors' }),
  );
  if (errorName && errors && errors.properties) {
    const keys = Object.keys(errors.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        file.import({
          asType: true,
          module: file.relativePathToFile({
            context: plugin.context,
            id: typesId,
          }),
          name: errorName,
        });
        errorsTypeReference = tsc.typeReferenceNode({
          typeName: errorName,
        });
      } else if (keys.length > 1) {
        file.import({
          asType: true,
          module: file.relativePathToFile({
            context: plugin.context,
            id: typesId,
          }),
          name: errorName,
        });
        const errorsType = tsc.typeReferenceNode({
          typeName: errorName,
        });
        const defaultType = tsc.literalTypeNode({
          literal: tsc.stringLiteral({ text: 'default' }),
        });
        errorsTypeReference = tsc.typeReferenceNode({
          typeArguments: [errorsType, defaultType],
          typeName: 'Omit',
        });
      }
    }
  }

  let responsesTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const responseName = fileTypeScript.getName(
    pluginTypeScript.api.getId({ operation, type: 'responses' }),
  );
  if (responseName && responses && responses.properties) {
    const keys = Object.keys(responses.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        file.import({
          asType: true,
          module: file.relativePathToFile({
            context: plugin.context,
            id: typesId,
          }),
          name: responseName,
        });
        responsesTypeReference = tsc.typeReferenceNode({
          typeName: responseName,
        });
      } else if (keys.length > 1) {
        file.import({
          asType: true,
          module: file.relativePathToFile({
            context: plugin.context,
            id: typesId,
          }),
          name: responseName,
        });
        const responsesType = tsc.typeReferenceNode({
          typeName: responseName,
        });
        const defaultType = tsc.literalTypeNode({
          literal: tsc.stringLiteral({ text: 'default' }),
        });
        responsesTypeReference = tsc.typeReferenceNode({
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
      type: tsc.typeIntersectionNode({
        types: replyTypes,
      }),
    });
  }

  if (!properties.length) {
    return;
  }

  const routeHandler: Property = {
    name: operation.id,
    type: tsc.typeNode('RouteHandler', [
      tsc.typeInterfaceNode({
        properties,
        useLegacyResolution: false,
      }),
    ]),
  };
  return routeHandler;
};

export const handler: FastifyPlugin['Handler'] = ({ plugin }) => {
  const file = plugin.createFile({
    id: fastifyId,
    path: plugin.output,
  });

  const routeHandlers: Array<Property> = [];

  plugin.forEach('operation', ({ operation }) => {
    const routeHandler = operationToRouteHandler({ operation, plugin });
    if (routeHandler) {
      routeHandlers.push(routeHandler);
    }
  });

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
    tsc.typeAliasDeclaration({
      exportType: true,
      name: identifier.name,
      type: tsc.typeInterfaceNode({
        properties: routeHandlers,
        useLegacyResolution: false,
      }),
    }),
  );
};
