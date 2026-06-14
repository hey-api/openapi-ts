import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function arktypeImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.ARKTYPE(factory),
  };
}

export type ArktypeImports = ReturnType<typeof arktypeImports>;
