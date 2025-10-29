import type ts from 'typescript';

import { operationResponsesMap } from '~/ir/operation';
import { hasParameterGroupObjectRequired } from '~/ir/parameter';
import type { IR } from '~/ir/types';
import { type Property, tsc } from '~/tsc';

import type { FastifyPlugin } from './types';

const operationToRouteHandler = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: FastifyPlugin['Instance'];
}): Property | undefined => {
  const properties: Array<Property> = [];

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
  });
  if (symbolDataType) {
    if (operation.body) {
      properties.push({
        isRequired: operation.body.required,
        name: 'Body',
        type: `${symbolDataType.placeholder}['body']`,
      });
    }

    if (operation.parameters) {
      if (operation.parameters.header) {
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.header,
          ),
          name: 'Headers',
          type: `${symbolDataType.placeholder}['headers']`,
        });
      }

      if (operation.parameters.path) {
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.path,
          ),
          name: 'Params',
          type: `${symbolDataType.placeholder}['path']`,
        });
      }

      if (operation.parameters.query) {
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.query,
          ),
          name: 'Querystring',
          type: `${symbolDataType.placeholder}['query']`,
        });
      }
    }
  }

  const { errors, responses } = operationResponsesMap(operation);

  let errorsTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const symbolErrorType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'errors',
  });
  if (symbolErrorType && errors && errors.properties) {
    const keys = Object.keys(errors.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        errorsTypeReference = tsc.typeReferenceNode({
          typeName: symbolErrorType.placeholder,
        });
      } else if (keys.length > 1) {
        const errorsType = tsc.typeReferenceNode({
          typeName: symbolErrorType.placeholder,
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
  const symbolResponseType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
  });
  if (symbolResponseType && responses && responses.properties) {
    const keys = Object.keys(responses.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        responsesTypeReference = tsc.typeReferenceNode({
          typeName: symbolResponseType.placeholder,
        });
      } else if (keys.length > 1) {
        const responsesType = tsc.typeReferenceNode({
          typeName: symbolResponseType.placeholder,
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

  const symbolRouteHandler = plugin.referenceSymbol(
    plugin.api.selector('RouteHandler'),
  );
  const routeHandler: Property = {
    name: operation.id,
    type: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeInterfaceNode({
          properties,
          useLegacyResolution: false,
        }),
      ],
      typeName: symbolRouteHandler.placeholder,
    }),
  };
  return routeHandler;
};

export const handler: FastifyPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: 'fastify',
    kind: 'type',
    name: 'RouteHandler',
    selector: plugin.api.selector('RouteHandler'),
  });

  const symbolRouteHandlers = plugin.registerSymbol({
    exported: true,
    kind: 'type',
    name: 'RouteHandlers',
  });

  const routeHandlers: Array<Property> = [];

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const routeHandler = operationToRouteHandler({ operation, plugin });
      if (routeHandler) {
        routeHandlers.push(routeHandler);
      }
    },
    {
      order: 'declarations',
    },
  );

  const node = tsc.typeAliasDeclaration({
    exportType: symbolRouteHandlers.exported,
    name: symbolRouteHandlers.placeholder,
    type: tsc.typeInterfaceNode({
      properties: routeHandlers,
      useLegacyResolution: false,
    }),
  });
  plugin.setSymbolValue(symbolRouteHandlers, node);
};
