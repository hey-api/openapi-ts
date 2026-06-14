import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function arktypeSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.ARKTYPE(factory),
  };
}

export type ArktypeSymbols = ReturnType<typeof arktypeSymbols>;
