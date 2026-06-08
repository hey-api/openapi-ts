import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function valibotSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.VALIBOT(factory),
  };
}

export type ValibotSymbols = ReturnType<typeof valibotSymbols>;
