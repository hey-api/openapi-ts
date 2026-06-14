import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function orpcImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    contract: SYMBOLS.ORPC_CONTRACT(factory),
  };
}

export type OrpcImports = ReturnType<typeof orpcImports>;
