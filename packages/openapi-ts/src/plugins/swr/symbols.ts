import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function swrSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.SWR(factory),
  };
}

export type SwrSymbols = ReturnType<typeof swrSymbols>;
