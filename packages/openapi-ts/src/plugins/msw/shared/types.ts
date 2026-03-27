import { $ } from '../../../ts-dsl';
import type { MswPlugin } from '../types';

export function createRequestHandlerOptions(plugin: MswPlugin['Instance']) {
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
        $.type.object().prop('baseUrl', (p) => p.type('string').optional()),
      ),
    );
  plugin.node(node);
}
