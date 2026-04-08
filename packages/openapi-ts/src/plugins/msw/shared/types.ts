import type { Symbol } from '@hey-api/codegen-core';

import { getTypedConfig } from '../../../config/utils';
import { $ } from '../../../ts-dsl';
import { getClientBaseUrlKey } from '../../@hey-api/client-core/utils';
import type { MswPlugin } from '../types';

export function createRequestHandlerOptions(plugin: MswPlugin['Instance']): Symbol {
  const symbol = plugin.symbol('RequestHandlerOptions', {
    meta: {
      artifact: 'msw',
      category: 'type',
      resource: 'request-handler-options',
    },
  });
  const symbolBaseUrl = plugin.querySymbol({
    artifact: 'types',
    category: 'type',
    resource: 'client',
    role: 'options',
  });
  const node = $.type
    .alias(symbol)
    .export()
    .type(
      $.type.and(
        $.type(plugin.imports.RequestHandlerOptions),
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
