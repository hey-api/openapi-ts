import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function valibotSymbols(plugin: PluginInstance) {
  return {
    ...SYMBOLS.VALIBOT(plugin),
  };
}

export type ValibotSymbols = ReturnType<typeof valibotSymbols>;
