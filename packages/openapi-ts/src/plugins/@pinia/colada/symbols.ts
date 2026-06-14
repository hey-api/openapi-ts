import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function piniaColadaSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.PINIA_COLADA(factory),
    axios: SYMBOLS.AXIOS(factory),
  };
}

export type PiniaColadaSymbols = ReturnType<typeof piniaColadaSymbols>;
