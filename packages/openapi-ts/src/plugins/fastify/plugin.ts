import { operationResponsesMap } from '~/ir/operation';
import { hasParameterGroupObjectRequired } from '~/ir/parameter';
import type { IR } from '~/ir/types';
import { $ } from '~/ts-dsl';

import type { FastifyPlugin } from './types';

const operationToRouteHandler = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: FastifyPlugin['Instance'];
}) => {
  const type = $.type.object();

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });
  if (symbolDataType) {
    if (operation.body) {
      type.prop('Body', (p) =>
        p
          .required(operation.body!.required)
          .type($.type(symbolDataType).idx($.type.literal('body'))),
      );
    }

    if (operation.parameters) {
      if (operation.parameters.header) {
        type.prop('Headers', (p) =>
          p
            .required(
              hasParameterGroupObjectRequired(operation.parameters!.header),
            )
            .type($.type(symbolDataType).idx($.type.literal('headers'))),
        );
      }

      if (operation.parameters.path) {
        type.prop('Params', (p) =>
          p
            .required(
              hasParameterGroupObjectRequired(operation.parameters!.path),
            )
            .type($.type(symbolDataType).idx($.type.literal('path'))),
        );
      }

      if (operation.parameters.query) {
        type.prop('Querystring', (p) =>
          p
            .required(
              hasParameterGroupObjectRequired(operation.parameters!.query),
            )
            .type($.type(symbolDataType).idx($.type.literal('query'))),
        );
      }
    }
  }

  const { errors, responses } = operationResponsesMap(operation);

  let errorsTypeReference: ReturnType<typeof $.type> | undefined;
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
        errorsTypeReference = $.type(symbolErrorType);
      } else if (keys.length > 1) {
        errorsTypeReference = $.type('Omit', (t) =>
          t.generics($.type(symbolErrorType), $.type.literal('default')),
        );
      }
    }
  }

  let responsesTypeReference: ReturnType<typeof $.type> | undefined = undefined;
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
        responsesTypeReference = $.type(symbolResponseType);
      } else if (keys.length > 1) {
        responsesTypeReference = $.type('Omit', (t) =>
          t.generics($.type(symbolResponseType), $.type.literal('default')),
        );
      }
    }
  }

  const replyTypes = [errorsTypeReference, responsesTypeReference].filter(
    (t): t is ReturnType<typeof $.type> => t !== undefined,
  );
  if (replyTypes.length) {
    type.prop('Reply', (p) => p.type($.type.and(...replyTypes)));
  }

  if (type.isEmpty) {
    return;
  }

  const symbolRouteHandler = plugin.referenceSymbol({
    category: 'type',
    resource: 'route-handler',
    tool: 'fastify',
  });
  return {
    name: operation.id,
    type: $.type(symbolRouteHandler, (t) => t.generic(type)),
  };
};

export const handler: FastifyPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('RouteHandler', {
    external: 'fastify',
    kind: 'type',
    meta: {
      category: 'type',
      resource: 'route-handler',
      tool: 'fastify',
    },
  });

  const symbolRouteHandlers = plugin.symbol('RouteHandlers');

  const type = $.type.object();

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const routeHandler = operationToRouteHandler({ operation, plugin });
      if (routeHandler) {
        type.prop(routeHandler.name, (p) => p.type(routeHandler.type));
      }
    },
    {
      order: 'declarations',
    },
  );

  const node = $.type.alias(symbolRouteHandlers).export().type(type);
  plugin.node(node);
};
