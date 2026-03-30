import type { Symbol } from '@hey-api/codegen-core';

import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';

export function createRequestHandlerOptions(plugin: MswPlugin['Instance']): Symbol {
  const symbol = plugin.symbol('RequestHandlerOptions', {
    meta: {
      category: 'type',
      resource: 'request-handler-options',
      tool: 'msw',
    },
  });
  const node = $.type
    .alias(symbol)
    .export()
    .type(
      $.type.and(
        $.type(plugin.external('msw.RequestHandlerOptions')),
        $.type
          .object()
          .prop('baseUrl', (p) => p.type('string').optional())
          .prop('responseFallback', (p) =>
            p.type($.type.or($.type.literal('error'), $.type.literal('passthrough'))).optional(),
          ),
      ),
    );
  plugin.node(node);
  return symbol;
}
