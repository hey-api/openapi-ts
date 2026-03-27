import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';
import { computeDominantResponse, type DominantResponse } from './computeDominantResponse';
import { getOperationComment } from './operation';
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

/**
 * Builds the response override expression for the `res` parameter.
 */
function buildResponseOverrideExpr({
  dominantResponse: { kind: responseKind, statusCode: responseStatusCode },
  plugin,
  symbolResolver,
}: {
  dominantResponse: DominantResponse;
  plugin: MswPlugin['Instance'];
  symbolResolver: Symbol;
}) {
  const symbolHttpResponse = plugin.external('msw.HttpResponse');

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

function createHandlerFunc({
  baseUrl,
  bodyType,
  dominantResponse,
  method,
  operation,
  paramsType,
  plugin,
  responseOrResolverType,
}: {
  baseUrl: string | undefined;
  bodyType: ReturnType<typeof $.type.idx | typeof $.type>;
  dominantResponse: DominantResponse;
  method: string;
  operation: IR.OperationObject;
  paramsType: ReturnType<typeof $.type | typeof $.type.object>;
  plugin: MswPlugin['Instance'];
  responseOrResolverType: ReturnType<typeof $.type | typeof $.type.or>;
}): Symbol {
  const symbolHttp = plugin.external('msw.http');
  const symbolHttpResponse = plugin.external('msw.HttpResponse');
  const symbolResolver = plugin.symbol('resolver');
  const symbolOptions = plugin.symbol('options');

  const symbol = plugin.symbol(
    applyNaming(`handle-${operation.id}`, {
      casing: 'camelCase', // TODO: expose as a config option
    }),
  );

  const handlerFunc = $.func(symbol)
    .export()
    .$if(plugin.config.comments && getOperationComment(operation), (f, v) => f.doc(v))
    .param(symbolResolver, (p) =>
      p
        .optional()
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
            .do(
              $.if($.typeofExpr(symbolResolver).eq($.literal('function'))).do(
                $(symbolResolver).call('info').return(),
              ),
            )
            .$if(dominantResponse.statusCode != null, (f) =>
              f.do(
                $.if(symbolResolver).do(
                  buildResponseOverrideExpr({
                    dominantResponse,
                    plugin,
                    symbolResolver,
                  }),
                ),
              ),
            )
            .do($.new(symbolHttpResponse, $.literal(null)).return()),
          symbolOptions,
        )
        .generics(paramsType, bodyType)
        .return(),
    );
  plugin.node(handlerFunc);
  return symbol;
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
}): Symbol {
  const dominantResponse = computeDominantResponse({ operation, plugin });

  const symbolResponsesType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
  });
  let responsesOverrideType: ReturnType<typeof $.type> | undefined;
  if (symbolResponsesType && dominantResponse.allCandidates.length > 1) {
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

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
  });

  let bodyType: ReturnType<typeof $.type.idx | typeof $.type>;
  if (operation.body && symbolDataType) {
    bodyType = $.type(symbolDataType).idx($.type.literal('body'));
  } else {
    bodyType = $.type('never');
  }

  let paramsType: ReturnType<typeof $.type | typeof $.type.object>;
  if (operation.parameters?.path && Object.keys(operation.parameters.path).length) {
    // Generate inline object type with sanitized param names derived from the
    // path string (not the IR keys, which are lowercased and may diverge from
    // the original spec names that the TypeScript plugin preserves).
    const objType = $.type.object();
    for (const parameter of Object.values(operation.parameters.path ?? {})) {
      // OpenAPI 3.x path params are always single-segment, so MSW (path-to-regexp v6)
      // will always provide a single string. Multi-segment params ({path+}) are proposed
      // for OpenAPI 4.0 — revisit this if/when that lands.
      objType.prop(sanitizeParamName(parameter.name), (p) => p.type('string'));
    }
    paramsType = objType;
  } else {
    paramsType = $.type('never');
  }

  const resolverType = $.type(plugin.external('msw.HttpResponseResolver')).generics(
    paramsType,
    bodyType,
    // omit response type to avoid DefaultBodyType constraint issues
  );

  // When examples are disabled, strip the example from the dominant response
  if (!examples) {
    dominantResponse.example = undefined;
  }

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

  return createHandlerFunc({
    baseUrl,
    bodyType,
    dominantResponse,
    method: operation.method,
    operation,
    paramsType,
    plugin,
    responseOrResolverType,
  });
}
