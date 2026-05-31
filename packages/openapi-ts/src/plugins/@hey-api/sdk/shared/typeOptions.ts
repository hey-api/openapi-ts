import { getTypedConfig } from '../../../../config/utils';
import { getClientPlugin } from '../../../../plugins/@hey-api/client-core/utils';
import { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';
import { isInstance } from '../v1/node';
import { nuxtTypeDefault, nuxtTypeResponse } from './constants';

export function createTypeOptions({ plugin }: { plugin: HeyApiSdkPlugin['Instance'] }) {
  const client = getClientPlugin(getTypedConfig(plugin));
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const symbolOptions = plugin.symbol('Options', {
    meta: {
      category: 'type',
      resource: 'client-options',
      tool: 'sdk',
    },
  });

  const typeOptions = $.type
    .alias(symbolOptions)
    .export()
    .$if(
      isNuxtClient,
      (t) =>
        t
          .generic('TComposable', (g) =>
            g.extends(plugin.symbols.Composable).default($.type.literal('$fetch')),
          )
          .generic('TData', (g) =>
            g.extends(plugin.symbols.TDataShape).default(plugin.symbols.TDataShape),
          )
          .generic(nuxtTypeResponse, (g) => g.default('unknown'))
          .generic(nuxtTypeDefault, (g) => g.default('undefined')),
      (t) =>
        t
          .generic('TData', (g) =>
            g.extends(plugin.symbols.TDataShape).default(plugin.symbols.TDataShape),
          )
          .generic('ThrowOnError', (g) => g.extends('boolean').default('boolean'))
          .generic('TResponse', (g) => g.default('unknown')),
    )
    .type(
      $.type.and(
        $.type(plugin.symbols.Options).$if(
          isNuxtClient,
          (t) =>
            t
              .generic('TComposable')
              .generic('TData')
              .generic(nuxtTypeResponse)
              .generic(nuxtTypeDefault),
          (t) => t.generic('TData').generic('ThrowOnError').generic('TResponse'),
        ),
        $.type
          .object()
          .prop('client', (p) =>
            p
              .doc([
                'You can provide a client instance returned by `createClient()` instead of',
                'individual options. This might be also useful if you want to implement a',
                'custom client.',
              ])
              .required(!plugin.config.client && !isInstance(plugin))
              .type(plugin.symbols.Client),
          )
          .prop('meta', (p) =>
            p
              .doc([
                'You can pass arbitrary values through the `meta` object. This can be',
                "used to access values that aren't defined as part of the SDK function.",
              ])
              .optional()
              .type($.type('Record').generics('string', 'unknown')),
          ),
      ),
    );
  plugin.node(typeOptions);
}
