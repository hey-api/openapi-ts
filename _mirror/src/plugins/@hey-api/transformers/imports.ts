import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function transformersImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    temporalPolyfill: SYMBOLS.TEMPORAL_POLYFILL(factory),
  };
}

export type TransformersImports = ReturnType<typeof transformersImports>;
