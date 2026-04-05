import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';
import { computeDominantResponse, type DominantResponse } from './computeDominantResponse';
import { getOperationComment } from './operation';
import { sanitizeParamName, sanitizePath } from './path';
import { createHandlerResponse } from './response';

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
              .prop('body', (p) => p.type($.type('T').idx($.type('K')))),
          ),
        $.type('Extract').generic($.type('keyof T')).generic($.type('number')),
      ),
    );
  plugin.node(toResponseUnionType);
};

function createHandlerNode({
  baseUrl,
  bodyType,
  method,
  operation,
  paramsType,
  plugin,
  response,
  responseOrResolverType,
}: {
  baseUrl: string | undefined;
  bodyType: ReturnType<typeof $.type.idx | typeof $.type>;
  method: string;
  operation: IR.OperationObject;
  paramsType: ReturnType<typeof $.type | typeof $.type.object>;
  plugin: MswPlugin['Instance'];
  response: DominantResponse;
  responseOrResolverType: ReturnType<typeof $.type | typeof $.type.or>;
}): Symbol {
  const symbolHttp = plugin.external('msw.http');
  const symbolResponse = plugin.symbol('response');
  const symbolOptions = plugin.symbol('options');

  const symbol = plugin.symbol(
    applyNaming(`handle-${operation.id}`, {
      casing: 'camelCase', // TODO: expose as a config option
    }),
  );

  const notImplementedResponse = $.new(
    'Response',
    $.literal('Not Implemented'),
    $.object()
      .pretty()
      .prop('status', $.literal(501))
      .prop('statusText', $.literal('Not Implemented')),
  );

  const hasResponse = response.example !== undefined;

  const handlerFunc = $.func(symbol)
    .export()
    .$if(plugin.config.comments && getOperationComment(operation), (f, v) => f.doc(v))
    .param(symbolResponse, (p) => p.optional().type(responseOrResolverType))
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
              $.if($.typeofExpr(symbolResponse).eq($.literal('function'))).do(
                $(symbolResponse).call('info').return(),
              ),
              $.const('body').assign(
                $(symbolResponse)
                  .attr('body')
                  .optional()
                  .$if(hasResponse, (c) => c.coalesce($.fromValue(response.example))),
              ),
              $.if($('body').neq($('undefined'))).do(
                createHandlerResponse({
                  plugin,
                  response,
                  symbol: symbolResponse,
                }).return(),
              ),
            )
            .$if(!hasResponse, (f) =>
              f.$if(
                plugin.config.responseFallback === 'error',
                (f) =>
                  f.do(
                    $.if(
                      $(symbolOptions)
                        .attr('responseFallback')
                        .optional()
                        .eq($.literal('passthrough')),
                    ).do($.return()),
                    notImplementedResponse.return(),
                  ),
                (f) =>
                  f.do(
                    $.if(
                      $(symbolOptions).attr('responseFallback').optional().eq($.literal('error')),
                    ).do(notImplementedResponse.return()),
                  ),
              ),
            ),
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
  const response = computeDominantResponse({ operation, plugin });

  const symbolResponsesType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
  });
  let responsesOverrideType: ReturnType<typeof $.type> | undefined;
  if (symbolResponsesType && response.allCandidates.length > 1) {
    if (!plugin.querySymbol({ category: 'type', resource: 'to-response-union' })) {
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
    response.example = undefined;
  }

  let responseOrResolverType: ReturnType<typeof $.type | typeof $.type.or>;
  if (response.statusCode != null && symbolResponsesType) {
    const responseType = $.type
      .object()
      .prop('body', (p) =>
        p.type($.type(symbolResponsesType).idx($.type.literal(response.statusCode!))),
      )
      .prop('status', (p) => p.optional().type($.type.literal(response.statusCode!)));
    responseOrResolverType = $.type.or(
      responseType,
      responsesOverrideType ? $.type.or(responsesOverrideType, resolverType) : resolverType,
    );
  } else {
    responseOrResolverType = resolverType;
  }

  return createHandlerNode({
    baseUrl,
    bodyType,
    method: operation.method,
    operation,
    paramsType,
    plugin,
    response,
    responseOrResolverType,
  });
}
