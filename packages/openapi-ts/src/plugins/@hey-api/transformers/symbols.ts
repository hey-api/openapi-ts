import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function transformersSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    temporalPolyfill: SYMBOLS.TEMPORAL_POLYFILL(factory),
  };
}

export type TransformersSymbols = ReturnType<typeof transformersSymbols>;
