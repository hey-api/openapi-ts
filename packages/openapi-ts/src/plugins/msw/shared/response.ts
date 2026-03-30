import type { Symbol } from '@hey-api/codegen-core';

import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';
import type { DominantResponse } from './computeDominantResponse';

/**
 * Builds the response override expression for the `res` parameter.
 */
export function createHandlerResponse({
  dominantResponse: { kind: responseKind, statusCode: responseStatusCode },
  plugin,
  symbolResolver,
}: {
  dominantResponse: DominantResponse;
  plugin: MswPlugin['Instance'];
  symbolResolver: Symbol;
}): ReturnType<typeof $.call | typeof $.new> {
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
      return $.new(symbolHttpResponse, resultExpr.coalesce($.literal(null)), statusOption);
    case 'json':
      return $(symbolHttpResponse)
        .attr('json')
        .call(resultExpr.coalesce($.literal(null)), statusOption);
    case 'text':
      return $(symbolHttpResponse)
        .attr('text')
        .call(
          $('JSON')
            .attr('stringify')
            .call(resultExpr.coalesce($.literal(''))),
          statusOption,
        );
    case 'void':
      return $.new(symbolHttpResponse, resultExpr.coalesce($.literal(null)), statusOption);
  }
}
