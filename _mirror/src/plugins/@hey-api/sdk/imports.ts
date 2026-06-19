import type { PluginInstance } from '@hey-api/shared';

import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import * as SYMBOLS from '../../../symbols';

export function sdkImports(plugin: PluginInstance) {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const factory = plugin.symbolFactory;

  return {
    Client: factory.register('Client', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.Client',
      },
    }),
    ClientMeta: factory.register('ClientMeta', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.ClientMeta',
      },
    }),
    Composable: factory.register('Composable', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.Composable',
      },
    }),
    Options: factory.register('Options', {
      external: clientModule,
      kind: 'type',
    }),
    RequestResult: factory.register('RequestResult', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.RequestResult',
      },
    }),
    ServerSentEventsResult: factory.register('ServerSentEventsResult', {
      external: clientModule,
      kind: 'type',
      meta: {
        resource: 'client.ServerSentEventsResult',
      },
    }),
    TDataShape: factory.register('TDataShape', {
      external: clientModule,
      kind: 'type',
    }),
    angular: SYMBOLS.ANGULAR(factory),
    buildClientParams: factory.register('buildClientParams', {
      external: clientModule,
      meta: {
        resource: 'client.buildClientParams',
      },
    }),
    formDataBodySerializer: factory.register('formDataBodySerializer', {
      external: clientModule,
      meta: {
        resource: 'client.formDataBodySerializer',
      },
    }),
    urlSearchParamsBodySerializer: factory.register('urlSearchParamsBodySerializer', {
      external: clientModule,
      meta: {
        resource: 'client.urlSearchParamsBodySerializer',
      },
    }),
  };
}

export type SdkImports = ReturnType<typeof sdkImports>;
