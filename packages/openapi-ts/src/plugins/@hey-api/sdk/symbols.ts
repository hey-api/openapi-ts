import type { PluginInstance } from '@hey-api/shared';

import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import * as SYMBOLS from '../../../symbols';

export function sdkSymbols(plugin: PluginInstance) {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const factory = plugin.symbolFactory;

  return {
    Client: plugin.symbol('Client', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.Client',
      },
    }),
    ClientMeta: plugin.symbol('ClientMeta', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.ClientMeta',
      },
    }),
    Composable: plugin.symbol('Composable', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.Composable',
      },
    }),
    Options: plugin.symbol('Options', {
      external: clientModule,
      kind: 'type',
    }),
    RequestResult: plugin.symbol('RequestResult', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.RequestResult',
      },
    }),
    ServerSentEventsResult: plugin.symbol('ServerSentEventsResult', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.ServerSentEventsResult',
      },
    }),
    TDataShape: plugin.symbol('TDataShape', {
      external: clientModule,
      kind: 'type',
    }),
    angular: SYMBOLS.ANGULAR(factory),
    buildClientParams: plugin.symbol('buildClientParams', {
      external: clientModule,
      meta: {
        resource: 'client.buildClientParams',
      },
    }),
    formDataBodySerializer: plugin.symbol('formDataBodySerializer', {
      external: clientModule,
      meta: {
        resource: 'client.formDataBodySerializer',
      },
    }),
    urlSearchParamsBodySerializer: plugin.symbol('urlSearchParamsBodySerializer', {
      external: clientModule,
      meta: {
        resource: 'client.urlSearchParamsBodySerializer',
      },
    }),
  };
}

export type SdkSymbols = ReturnType<typeof sdkSymbols>;
