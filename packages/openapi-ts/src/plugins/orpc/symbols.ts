import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function orpcSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    contract: SYMBOLS.ORPC_CONTRACT(factory),
  };
}

export type OrpcSymbols = ReturnType<typeof orpcSymbols>;
