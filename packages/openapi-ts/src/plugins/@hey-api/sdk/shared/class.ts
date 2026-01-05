import type { Symbol } from '@hey-api/codegen-core';

import { $ } from '~/ts-dsl';

import type { HeyApiSdkPlugin } from '../types';

export const createRegistryClass = ({
  plugin,
  sdkSymbol,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  sdkSymbol: Symbol;
  symbol: Symbol;
}): ReturnType<typeof $.class> => {
  const symbolDefaultKey = plugin.symbol('defaultKey');
  const symbolInstances = plugin.symbol('instances');
  return $.class(symbol)
    .generic('T')
    .field(symbolDefaultKey, (f) =>
      f.private().readonly().assign($.literal('default')),
    )
    .newline()
    .field(symbolInstances, (f) =>
      f
        .private()
        .readonly()
        .type($.type('Map').generics('string', 'T'))
        .assign($.new('Map')),
    )
    .newline()
    .method('get', (m) =>
      m
        .returns('T')
        .param('key', (p) => p.type('string').optional())
        .do(
          $.const('instance').assign(
            $('this')
              .attr(symbolInstances)
              .attr('get')
              .call($('key').coalesce($('this').attr(symbolDefaultKey))),
          ),
          $.if($.not('instance')).do(
            $.throw('Error').message(
              $.template('No SDK client found. Create one with "new ')
                .add(sdkSymbol)
                .add('()" to fix this error.'),
            ),
          ),
          $.return('instance'),
        ),
    )
    .newline()
    .method('set', (m) =>
      m
        .returns('void')
        .param('value', (p) => p.type('T'))
        .param('key', (p) => p.type('string').optional())
        .do(
          $('this')
            .attr(symbolInstances)
            .attr('set')
            .call($('key').coalesce($('this').attr(symbolDefaultKey)), 'value'),
        ),
    );
};

export const createClientClass = ({
  plugin,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  symbol: Symbol;
}): ReturnType<typeof $.class> => {
  const symClient = plugin.getSymbol({ category: 'client' });
  const optionalClient = Boolean(plugin.config.client && symClient);
  const symbolClient = plugin.external('client.Client');
  return $.class(symbol)
    .field('client', (f) => f.protected().type(symbolClient))
    .newline()
    .init((i) =>
      i
        .param('args', (p) =>
          p
            .optional(optionalClient)
            .type(
              $.type
                .object()
                .prop('client', (p) =>
                  p.optional(optionalClient).type(symbolClient),
                ),
            ),
        )
        .do(
          $('this')
            .attr('client')
            .assign(
              $('args')
                .attr('client')
                .optional(optionalClient)
                .$if(optionalClient, (a) => a.coalesce(symClient!)),
            ),
        ),
    );
};
