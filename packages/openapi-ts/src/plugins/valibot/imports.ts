import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function valibotImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.VALIBOT(factory),
  };
}

export type ValibotImports = ReturnType<typeof valibotImports>;
