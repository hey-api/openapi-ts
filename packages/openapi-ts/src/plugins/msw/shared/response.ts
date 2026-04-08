import type { Symbol } from '@hey-api/codegen-core';

import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';
import type { DominantResponse } from './computeDominantResponse';

export function createHttpResponse({
  plugin,
  response,
  symbol,
}: {
  plugin: MswPlugin['Instance'];
  response: DominantResponse;
  symbol: Symbol; // response
}): ReturnType<typeof $.call | typeof $.new> {
  const symbolHttpResponse = plugin.external('msw.HttpResponse');

  const init = $.object().prop(
    'status',
    $(symbol)
      .attr('status')
      .optional()
      .$if(response.statusCode !== undefined, (e) => e.coalesce($.literal(response.statusCode!))),
  );
  const body = 'body';

  switch (response.kind) {
    case 'binary':
      return $.new(symbolHttpResponse, body, init);
    case 'json':
      return $(symbolHttpResponse).attr('json').call(body, init);
    case 'text':
      return $(symbolHttpResponse)
        .attr('text')
        .call(
          $.ternary($(body).typeofExpr().eq($.literal('string')))
            .do(body)
            .otherwise($('JSON').attr('stringify').call(body)),
          init,
        );
    case 'void':
      return $.new(symbolHttpResponse, body, init);
  }
}
