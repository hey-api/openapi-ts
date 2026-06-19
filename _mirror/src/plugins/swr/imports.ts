import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function swrImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.SWR(factory),
  };
}

export type SwrImports = ReturnType<typeof swrImports>;
