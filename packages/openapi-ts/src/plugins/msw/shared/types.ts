import type { Symbol } from '@hey-api/codegen-core';

import { getTypedConfig } from '../../../config/utils';
import { $ } from '../../../ts-dsl';
import { getClientBaseUrlKey } from '../../@hey-api/client-core/utils';
import type { MswPlugin } from '../types';

export function createRequestHandlerOptions(plugin: MswPlugin['Instance']): Symbol {
  const symbol = plugin.symbol('RequestHandlerOptions', {
    meta: {
      category: 'type',
      resource: 'request-handler-options',
      tool: 'msw',
    },
  });
  const symbolBaseUrl = plugin.querySymbol({
    category: 'type',
    resource: 'client',
    role: 'options',
    tool: 'typescript',
  });
  const node = $.type
    .alias(symbol)
    .export()
    .type(
      $.type.and(
        $.type(plugin.external('msw.RequestHandlerOptions')),
        $.type
          .object()
          .prop('baseUrl', (p) =>
            p
              .$if(
                symbolBaseUrl,
                (p, s) =>
                  p.type(
                    $.type(s).idx($.type.literal(getClientBaseUrlKey(getTypedConfig(plugin)))),
                  ),
                (p) => p.type('string'),
              )
              .optional(),
          )
          .prop('responseFallback', (p) =>
            p.type($.type.or($.type.literal('error'), $.type.literal('passthrough'))).optional(),
          ),
      ),
    );
  plugin.node(node);
  return symbol;
}
