import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function mswImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.MSW(factory),
  };
}

export type MswImports = ReturnType<typeof mswImports>;
