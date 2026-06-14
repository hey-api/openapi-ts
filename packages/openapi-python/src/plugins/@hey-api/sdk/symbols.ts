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
      meta: {
        resource: 'client.Client',
      },
    }),
    buildClientParams: plugin.symbol('build_client_params', {
      external: clientModule,
      meta: {
        resource: 'client.build_client_params',
      },
    }),
    funcTools: SYMBOLS.FUNC_TOOLS(factory),
    typing: SYMBOLS.TYPING(factory),
  };
}

export type SdkSymbols = ReturnType<typeof sdkSymbols>;
