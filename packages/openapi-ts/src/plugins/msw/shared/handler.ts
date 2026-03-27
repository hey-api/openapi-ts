import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';
import { computeDominantResponse, type DominantResponse } from './computeDominantResponse';
import { sanitizeParamName, sanitizePath } from './path';

const emitToResponseUnion = (plugin: MswPlugin['Instance']) => {
  const symbol = plugin.symbol('ToResponseUnion', {
    meta: {
      category: 'type',
      resource: 'to-response-union',
    },
  });
  const extractKeyofTNumber = $.type('Extract')
    .generic($.type('keyof T'))
    .generic($.type('number'));
  const toResponseUnionType = $.type
    .alias(symbol)
    .generic('T')
    .type(
      $.type.idx(
        $.type
          .mapped('K')
          .key(extractKeyofTNumber)
          .type(
            $.type
              .object()
              .prop('status', (p) => p.type('K'))
              .prop('result', (p) => p.type($.type('T').idx($.type('K')))),
          ),
        $.type('Extract').generic($.type('keyof T')).generic($.type('number')),
      ),
    );
  plugin.node(toResponseUnionType);
};

const emitHandlerFactory = (plugin: MswPlugin['Instance']) => {
  const symbol = plugin.symbol('HttpHandlerFactory', {
    meta: {
      category: 'type',
      resource: 'http-handler-factory',
    },
  });
  const handlerFactoryType = $.type
    .alias(symbol)
    .generic('ResponseOrResolver')
    .type(
      $.type
        .func()
        .param('responseOrResolver', (p) => p.type('ResponseOrResolver'))
        .param('options', (p) => p.type(plugin.external('msw.RequestHandlerOptions')).optional())
        .returns(plugin.external('msw.HttpHandler')),
    );
  plugin.node(handlerFactoryType);
};

const emitOptionalParamHandlerFactory = (plugin: MswPlugin['Instance']) => {
  const symbol = plugin.symbol('OptionalHttpHandlerFactory', {
    meta: {
      category: 'type',
      resource: 'optional-http-handler-factory',
    },
  });
  const optionalHandlerFactoryType = $.type
    .alias(symbol)
    .generic('ResponseOrResolver')
    .type(
      $.type
        .func()
        .param('responseOrResolver', (p) => p.type('ResponseOrResolver').optional())
        .param('options', (p) => p.type(plugin.external('msw.RequestHandlerOptions')).optional())
        .returns(plugin.external('msw.HttpHandler')),
    );
  plugin.node(optionalHandlerFactoryType);
};

const extractPathParamNames = (path: string) => {
  const names: Array<string> = [];
  for (const match of path.matchAll(/\{([^}]+)\}/g)) {
    names.push(match[1]!);
  }
  return names;
};

/**
 * Builds the response override expression for the `res` parameter.
 * When `res` is an object with a `result` property, it uses
 * `res.result` as the value and `res.status` as the status code.
 */
function buildResponseOverrideExpr({
  dominantResponse: { kind: responseKind, statusCode: responseStatusCode },
  symbolHttpResponse,
  symbolResolver,
}: {
  dominantResponse: DominantResponse;
  symbolHttpResponse: Symbol;
  symbolResolver: Symbol;
}) {
  const statusOption = $.object().prop(
    'status',
    responseStatusCode
      ? $(symbolResolver).attr('status').coalesce($.literal(responseStatusCode))
      : $(symbolResolver).attr('status'),
  );
  const resultExpr = $(symbolResolver).attr('result');

  switch (responseKind) {
    case 'binary':
      return $.new(symbolHttpResponse, resultExpr.coalesce($.literal(null)), statusOption).return();
    case 'json':
      return $(symbolHttpResponse)
        .attr('json')
        .call(resultExpr.coalesce($.literal(null)), statusOption)
        .return();
    case 'text':
      return $(symbolHttpResponse)
        .attr('text')
        .call(resultExpr.coalesce($.literal(null)), statusOption)
        .return();
    case 'void':
      return $.new(symbolHttpResponse, resultExpr.coalesce($.literal(null)), statusOption).return();
  }
}

/**
 * Builds an arrow function that creates an MSW handler for a single operation.
 * The response method and status code are inferred from the operation's responses.
 */
function createHandlerFunc({
  baseUrl,
  bodyType,
  dominantResponse,
  hasResponseOverride,
  method,
  operation,
  paramsType,
  plugin,
  responseOrResolverType,
  symbol,
  symbolHttp,
  symbolHttpResponse,
}: {
  baseUrl: string | undefined;
  bodyType: ReturnType<typeof $.type.idx | typeof $.type>;
  dominantResponse: DominantResponse;
  hasResponseOverride: boolean;
  method: string;
  operation: IR.OperationObject;
  paramsType: ReturnType<typeof $.type | typeof $.type.object>;
  plugin: MswPlugin['Instance'];
  responseOrResolverType: ReturnType<typeof $.type | typeof $.type.or>;
  symbol: Symbol;
  symbolHttp: Symbol;
  symbolHttpResponse: Symbol;
}) {
  const symbolResolver = plugin.symbol('resolver');
  const symbolOptions = plugin.symbol('options');

  return $.func(symbol)
    .export()
    .param(symbolResolver, (p) =>
      p
        .type(responseOrResolverType)
        .$if(dominantResponse.example != null && dominantResponse.statusCode != null, (pp) =>
          pp.assign(
            $.fromValue({
              result: dominantResponse.example,
              status: dominantResponse.statusCode,
            }),
          ),
        ),
    )
    .param(symbolOptions, (p) =>
      p.optional().type(
        plugin.referenceSymbol({
          category: 'type',
          resource: 'request-handler-options',
          tool: 'msw',
        }),
      ),
    )
    .returns(plugin.external('msw.HttpHandler'))
    .do(
      $(symbolHttp)
        .attr(method)
        .call(
          $.template(
            $(symbolOptions)
              .attr('baseUrl')
              .optional()
              .coalesce($.literal(baseUrl ?? '')),
          ).add(sanitizePath(operation.path)),
          $.func()
            .param('info')
            .$if(
              hasResponseOverride,
              (f) =>
                f.do(
                  $.if(
                    $($.typeofExpr(symbolResolver).eq($.literal('object'))).and(
                      $(symbolResolver).attr('result'),
                    ),
                  ).do(
                    buildResponseOverrideExpr({
                      dominantResponse,
                      symbolHttpResponse,
                      symbolResolver,
                    }),
                  ),
                  $.if($.typeofExpr(symbolResolver).eq($.literal('function'))).do(
                    $(symbolResolver).call('info').return(),
                  ),
                  $.new(symbolHttpResponse, $.literal(null)).return(),
                ),
              (f) =>
                f.do(
                  $.if($.typeofExpr(symbolResolver).eq($.literal('function'))).do(
                    $(symbolResolver).call('info').return(),
                  ),
                  $.new(symbolHttpResponse, $.literal(null)).return(),
                ),
            ),
          symbolOptions,
        )
        .generics(paramsType, bodyType)
        .return(),
    );
}

export function getHandler({
  baseUrl,
  examples,
  operation,
  plugin,
}: {
  baseUrl: string | undefined;
  examples: boolean;
  operation: IR.OperationObject;
  plugin: MswPlugin['Instance'];
}) {
  const dominantResponse = computeDominantResponse({ operation, plugin });

  const symbolHttp = plugin.external('msw.http');
  const symbolHttpResponse = plugin.external('msw.HttpResponse');

  // Query response type from @hey-api/typescript
  const symbolResponsesType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
  });
  let responsesOverrideType: ReturnType<typeof $.type> | undefined;
  if (symbolResponsesType && dominantResponse.allCandidates.length > 1) {
    // We only neeed to add ToResponseUnion if there are multiple responses
    if (!plugin.getSymbol({ category: 'type', resource: 'to-response-union' })) {
      emitToResponseUnion(plugin);
    }
    responsesOverrideType = $.type(
      plugin.referenceSymbol({
        category: 'type',
        resource: 'to-response-union',
      }),
    ).generic(symbolResponsesType);
  }

  // Query data type for parameters
  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });

  let paramsType: ReturnType<typeof $.type | typeof $.type.object>;
  if (operation.parameters?.path && Object.keys(operation.parameters.path).length) {
    // Generate inline object type with sanitized param names derived from the
    // path string (not the IR keys, which are lowercased and may diverge from
    // the original spec names that the TypeScript plugin preserves).
    const objType = $.type.object();
    for (const name of extractPathParamNames(operation.path)) {
      // OpenAPI 3.x path params are always single-segment, so MSW (path-to-regexp v6)
      // will always provide a single string. Multi-segment params ({path+}) are proposed
      // for OpenAPI 4.0 — revisit this if/when that lands.
      objType.prop(sanitizeParamName(name), (p) => p.type('string'));
    }
    paramsType = objType;
  } else {
    paramsType = $.type('never');
  }

  let bodyType: ReturnType<typeof $.type.idx | typeof $.type>;
  if (operation.body && symbolDataType) {
    bodyType = $.type(symbolDataType).idx($.type.literal('body'));
  } else {
    bodyType = $.type('never');
  }

  // Omit response type generic to avoid MSW's DefaultBodyType constraint issues
  const resolverType = $.type(plugin.external('msw.HttpResponseResolver')).generics(
    paramsType,
    bodyType,
  );

  // When examples are disabled, strip the example from the dominant response
  if (!examples) {
    dominantResponse.example = undefined;
  }

  const isOptional =
    // if there is no dominantResponse, it means there is no status code definition
    // so we can set the default response as null
    !(dominantResponse.statusCode != null) ||
    // if there is example, the param is optional because example can be used
    // if it's void, the param is optional because we can define the default (`null`)
    dominantResponse.example != null ||
    dominantResponse.kind === 'void';

  let responseOrResolverType: ReturnType<typeof $.type | typeof $.type.or>;
  if (dominantResponse.statusCode != null && symbolResponsesType) {
    const dominantResponseType = $.type
      .object()
      .prop('result', (p) =>
        p.type($.type(symbolResponsesType).idx($.type.literal(dominantResponse.statusCode!))),
      )
      .prop('status', (p) => p.optional().type($.type.literal(dominantResponse.statusCode!)));
    responseOrResolverType = $.type.or(
      dominantResponseType,
      responsesOverrideType ? $.type.or(responsesOverrideType, resolverType) : resolverType,
    );
  } else {
    responseOrResolverType = resolverType;
  }

  let type: ReturnType<typeof $.type>;
  if (isOptional) {
    if (!plugin.getSymbol({ category: 'type', resource: 'optional-http-handler-factory' })) {
      emitOptionalParamHandlerFactory(plugin);
    }
    type = $.type(
      plugin.referenceSymbol({
        category: 'type',
        resource: 'optional-http-handler-factory',
      }),
    ).generic(responseOrResolverType);
  } else {
    if (!plugin.getSymbol({ category: 'type', resource: 'http-handler-factory' })) {
      emitHandlerFactory(plugin);
    }
    type = $.type(
      plugin.referenceSymbol({
        category: 'type',
        resource: 'http-handler-factory',
      }),
    ).generic(responseOrResolverType);
  }

  const symbol = plugin.symbol(
    applyNaming(`handle-${operation.id}`, {
      casing: 'camelCase', // TODO: expose as a config option
    }),
  );
  return {
    isOptional,
    node: createHandlerFunc({
      baseUrl,
      bodyType,
      dominantResponse,
      hasResponseOverride: dominantResponse.statusCode != null,
      method: operation.method,
      operation,
      paramsType,
      plugin,
      responseOrResolverType,
      symbol,
      symbolHttp,
      symbolHttpResponse,
    }),
    symbol,
    type,
  };
}
