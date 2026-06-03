import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function tanStackQuerySymbols(plugin: PluginInstance) {
  return {
    ...SYMBOLS.TANSTACK_QUERY(plugin),
    axios: SYMBOLS.AXIOS(plugin.symbolFactory),
  };
}

export type TanStackQuerySymbols = ReturnType<typeof tanStackQuerySymbols>;
