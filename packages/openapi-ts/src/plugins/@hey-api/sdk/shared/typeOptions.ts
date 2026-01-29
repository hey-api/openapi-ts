import { getTypedConfig } from '../../../../config/utils';
import { clientFolderAbsolutePath } from '../../../../generate/client';
import { getClientPlugin } from '../../../../plugins/@hey-api/client-core/utils';
import { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';
import { isInstance } from '../v1/node';
import { nuxtTypeDefault, nuxtTypeResponse } from './constants';

export const createTypeOptions = ({ plugin }: { plugin: HeyApiSdkPlugin['Instance'] }) => {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const client = getClientPlugin(getTypedConfig(plugin));
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const symbolTDataShape = plugin.symbol('TDataShape', {
    external: clientModule,
    kind: 'type',
  });
  const symbolClient = plugin.symbol('Client', {
    external: clientModule,
    kind: 'type',
    meta: {
      category: 'external',
      resource: 'client.Client',
      tool: client.name,
    },
  });
  const symbolClientOptions = plugin.symbol('Options', {
    external: clientModule,
    kind: 'type',
  });
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
            g.extends(plugin.external('client.Composable')).default($.type.literal('$fetch')),
          )
          .generic('TData', (g) => g.extends(symbolTDataShape).default(symbolTDataShape))
          .generic(nuxtTypeResponse, (g) => g.default('unknown'))
          .generic(nuxtTypeDefault, (g) => g.default('undefined')),
      (t) =>
        t
          .generic('TData', (g) => g.extends(symbolTDataShape).default(symbolTDataShape))
          .generic('ThrowOnError', (g) => g.extends('boolean').default('boolean')),
    )
    .type(
      $.type.and(
        $.type(symbolClientOptions).$if(
          isNuxtClient,
          (t) =>
            t
              .generic('TComposable')
              .generic('TData')
              .generic(nuxtTypeResponse)
              .generic(nuxtTypeDefault),
          (t) => t.generic('TData').generic('ThrowOnError'),
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
              .type(symbolClient),
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
};
