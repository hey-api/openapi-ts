import type { PluginInstance } from '@hey-api/shared';

import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import * as SYMBOLS from '../../../symbols';
import { getClientPlugin } from '../client-core/utils';

export function sdkSymbols(plugin: PluginInstance) {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const client = getClientPlugin(getTypedConfig(plugin));
  return {
    Client: plugin.symbol('Client', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.Client',
        tool: client.name,
      },
    }),
    Composable: plugin.symbol('Composable', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.Composable',
        tool: client.name,
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
        tool: client.name,
      },
    }),
    ServerSentEventsResult: plugin.symbol('ServerSentEventsResult', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.ServerSentEventsResult',
        tool: client.name,
      },
    }),
    TDataShape: plugin.symbol('TDataShape', {
      external: clientModule,
      kind: 'type',
    }),
    angular: SYMBOLS.ANGULAR(plugin),
    buildClientParams: plugin.symbol('buildClientParams', {
      external: clientModule,
      meta: {
        resource: 'client.buildClientParams',
        tool: client.name,
      },
    }),
    formDataBodySerializer: plugin.symbol('formDataBodySerializer', {
      external: clientModule,
      meta: {
        resource: 'client.formDataBodySerializer',
        tool: client.name,
      },
    }),
    urlSearchParamsBodySerializer: plugin.symbol('urlSearchParamsBodySerializer', {
      external: clientModule,
      meta: {
        resource: 'client.urlSearchParamsBodySerializer',
        tool: client.name,
      },
    }),
  };
}

export type SdkSymbols = ReturnType<typeof sdkSymbols>;
