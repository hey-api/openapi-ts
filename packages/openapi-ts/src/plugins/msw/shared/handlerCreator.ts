import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';
import { computeDominantResponse, type DominantResponse } from './computeDominantResponse';

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
  const symbolHttpHandler = plugin.external('msw.HttpHandler');
  const symbolRequestHandlerOptions = plugin.external('msw.RequestHandlerOptions');
  const handlerFactoryType = $.type
    .alias(symbol)
    .generic('ResponseOrResolver')
    .type(
      $.type
        .func()
        .param('responseOrResolver', (p) => p.type('ResponseOrResolver'))
        .param('options', (p) => p.type($.type(symbolRequestHandlerOptions)).optional())
        .returns($.type(symbolHttpHandler)),
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
  const symbolHttpHandler = plugin.external('msw.HttpHandler');
  const symbolRequestHandlerOptions = plugin.external('msw.RequestHandlerOptions');
  const optionalHandlerFactoryType = $.type
    .alias(symbol)
    .generic('ResponseOrResolver')
    .type(
      $.type
        .func()
        .param('responseOrResolver', (p) => p.type('ResponseOrResolver').optional())
        .param('options', (p) => p.type($.type(symbolRequestHandlerOptions)).optional())
        .returns($.type(symbolHttpHandler)),
    );
  plugin.node(optionalHandlerFactoryType);
};

// path-to-regexp v6 (used by MSW) only allows word characters in param names.
// So transform what's necessary: replace non-word chars with camelCase transitions,
// preserving the original casing to stay consistent with the TypeScript plugin's types.
const sanitizeParamName = (name: string) =>
  name.replace(/\W+(.)?/g, (_, char?: string) => (char ? char.toUpperCase() : ''));

const extractPathParamNames = (path: string) => {
  const names: Array<string> = [];
  for (const match of path.matchAll(/\{([^}]+)\}/g)) {
    names.push(match[1]!);
  }
  return names;
};

const toMswPath = (path: string) =>
  path
    .replace(/\{([^}]+)\}/g, (_, name: string) => `\0${sanitizeParamName(name)}`)
    .replace(/:/g, String.raw`\:`)
    .replace(/\0/g, ':');

const httpMethodMap: Record<string, string> = {
  delete: 'delete',
  get: 'get',
  head: 'head',
  options: 'options',
  patch: 'patch',
  post: 'post',
  put: 'put',
  trace: 'trace',
};

/**
 * Builds the response override expression for the `res` parameter.
 * When `res` is an object with a `result` property, it uses
 * `res.result` as the value and `res.status` as the status code.
 */
function buildResponseOverrideExpr({
  dominantResponse: { kind: responseKind, statusCode: responseStatusCode },
  responseOrFnName,
  symbolHttpResponse,
}: {
  dominantResponse: DominantResponse;
  responseOrFnName: string;
  symbolHttpResponse: Symbol;
}) {
  const statusOption = $.object().prop(
    'status',
    responseStatusCode
      ? $(responseOrFnName).attr('status').coalesce($.literal(responseStatusCode))
      : $(responseOrFnName).attr('status'),
  );
  const resultExpr = $(responseOrFnName).attr('result');

  switch (responseKind) {
    case 'void':
      return $.func().do(
        $.new(symbolHttpResponse, resultExpr.coalesce($.literal(null)), statusOption).return(),
      );
    case 'json':
      return $.func().do(
        $(symbolHttpResponse)
          .attr('json')
          .call(resultExpr.coalesce($.literal(null)), statusOption)
          .return(),
      );
    case 'text':
      return $.func().do(
        $(symbolHttpResponse)
          .attr('text')
          .call(resultExpr.coalesce($.literal(null)), statusOption)
          .return(),
      );
    case 'binary':
      return $.func().do(
        $.new(symbolHttpResponse, resultExpr.coalesce($.literal(null)), statusOption).return(),
      );
  }
}

/**
 * Builds an arrow function that creates an MSW handler for a single operation.
 * The response method and status code are inferred from the operation's responses.
 */
function createHandlerCreatorFn({
  dominantResponse,
  hasResponseOverride,
  method,
  operation,
  symbolHttp,
  symbolHttpResponse,
  symbolResolveToNull,
}: {
  dominantResponse: DominantResponse;
  hasResponseOverride: boolean;
  method: string;
  operation: IR.OperationObject;
  symbolHttp: Symbol;
  symbolHttpResponse: Symbol;
  symbolResolveToNull: Symbol;
}) {
  const responseOrFnName = 'res';
  const optionsName = 'options';

  const fallbackTernary = $.ternary($.typeofExpr(responseOrFnName).eq($.literal('function')))
    .do(responseOrFnName)
    .otherwise($(symbolResolveToNull));

  const resolverArg = hasResponseOverride
    ? $.ternary(
        $($.typeofExpr(responseOrFnName).eq($.literal('object'))).and(
          $(responseOrFnName).attr('result'),
        ),
      )
        .do(
          buildResponseOverrideExpr({
            dominantResponse,
            responseOrFnName,
            symbolHttpResponse,
          }),
        )
        .otherwise(fallbackTernary)
    : fallbackTernary;

  const httpCall = $(symbolHttp)
    .attr(method)
    .call(
      $.template($('baseUrl')).add($.literal(toMswPath(operation.path))),
      resolverArg,
      optionsName,
    );

  return $.func()
    .$if(
      dominantResponse.example != null && dominantResponse.statusCode != null,
      (f) =>
        f.param(responseOrFnName, (p) =>
          p.assign(
            $.fromValue({
              result: dominantResponse.example,
              status: dominantResponse.statusCode,
            }),
          ),
        ),
      (f) => f.param(responseOrFnName),
    )
    .param(optionsName)
    .do(httpCall.return());
}

export function operationToHandlerCreator({
  examples,
  operation,
  plugin,
}: {
  examples: boolean;
  operation: IR.OperationObject;
  plugin: MswPlugin['Instance'];
}) {
  const method = httpMethodMap[operation.method];
  if (!method) return;

  const dominantResponse = computeDominantResponse({ operation, plugin });

  const symbolHttp = plugin.external('msw.http');
  const symbolHttpResponse = plugin.external('msw.HttpResponse');
  const symbolHttpResponseResolver = plugin.external('msw.HttpResponseResolver');
  const symbolHttpHandlerFactory = plugin.referenceSymbol({
    category: 'type',
    resource: 'http-handler-factory',
  });
  const symbolOptionalHttpHandlerFactory = plugin.referenceSymbol({
    category: 'type',
    resource: 'optional-http-handler-factory',
  });
  const symbolToResponseUnion = plugin.referenceSymbol({
    category: 'type',
    resource: 'to-response-union',
  });
  const symbolResolveToNull = plugin.referenceSymbol({
    category: 'function',
    resource: 'resolve-to-null',
  });

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
    responsesOverrideType = $.type(symbolToResponseUnion).generic(symbolResponsesType);
  }

  // Query data type for parameters
  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });

  // Build HttpResponseResolver generics
  const hasPathParams =
    operation.parameters?.path && Object.keys(operation.parameters.path).length > 0;
  const hasBody = !!operation.body;

  let pathParamsType: ReturnType<typeof $.type | typeof $.type.object> | undefined;
  if (hasPathParams) {
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
    pathParamsType = objType;
  }

  let bodyType: ReturnType<typeof $.type.idx | typeof $.type> | undefined;
  if (hasBody && symbolDataType) {
    bodyType = $.type(symbolDataType).idx($.type.literal('body'));
  }

  // Build the resolver type: HttpResponseResolver<Params, Body>
  // Omit response type generic to avoid MSW's DefaultBodyType constraint issues
  const hasResolverGenerics = pathParamsType || bodyType;
  const resolverType = hasResolverGenerics
    ? $.type(symbolHttpResponseResolver).generics(
        pathParamsType ?? $.type('never'),
        bodyType ?? $.type('never'),
      )
    : $.type(symbolHttpResponseResolver);

  // When examples are disabled, strip the example from the dominant response
  if (!examples) {
    dominantResponse.example = undefined;
  }

  const handlerCreator = createHandlerCreatorFn({
    dominantResponse,
    hasResponseOverride: dominantResponse.statusCode != null,
    method,
    operation,
    symbolHttp,
    symbolHttpResponse,
    symbolResolveToNull,
  });

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

  let handlerType: ReturnType<typeof $.type>;
  if (isOptional) {
    if (!plugin.getSymbol({ category: 'type', resource: 'optional-http-handler-factory' })) {
      emitOptionalParamHandlerFactory(plugin);
    }
    handlerType = $.type(symbolOptionalHttpHandlerFactory).generic(responseOrResolverType);
  } else {
    if (!plugin.getSymbol({ category: 'type', resource: 'http-handler-factory' })) {
      emitHandlerFactory(plugin);
    }
    handlerType = $.type(symbolHttpHandlerFactory).generic(responseOrResolverType);
  }

  return {
    isOptional,
    name: `${operation.id}Mock`,
    type: handlerType,
    value: handlerCreator,
  };
}
