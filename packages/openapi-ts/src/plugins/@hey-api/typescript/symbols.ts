import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function typescriptSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    temporalPolyfill: SYMBOLS.TEMPORAL_POLYFILL(factory),
  };
}

export type TypeScriptSymbols = ReturnType<typeof typescriptSymbols>;
