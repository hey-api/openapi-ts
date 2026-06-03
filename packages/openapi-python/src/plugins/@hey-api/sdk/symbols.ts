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
      meta: {
        resource: 'client.Client',
        tool: client.name,
      },
    }),
    buildClientParams: plugin.symbol('build_client_params', {
      external: clientModule,
      meta: {
        resource: 'client.build_client_params',
        tool: client.name,
      },
    }),
    funcTools: SYMBOLS.FUNC_TOOLS(plugin.symbolFactory),
    typing: SYMBOLS.TYPING(plugin.symbolFactory),
  };
}

export type SdkSymbols = ReturnType<typeof sdkSymbols>;
