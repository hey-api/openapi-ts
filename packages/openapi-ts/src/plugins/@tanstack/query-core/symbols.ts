import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function tanStackQuerySymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.TANSTACK_QUERY(plugin),
    axios: SYMBOLS.AXIOS(factory),
  };
}

export type TanStackQuerySymbols = ReturnType<typeof tanStackQuerySymbols>;
