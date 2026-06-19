import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function piniaColadaImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.PINIA_COLADA(factory),
    axios: SYMBOLS.AXIOS(factory),
  };
}

export type PiniaColadaImports = ReturnType<typeof piniaColadaImports>;
