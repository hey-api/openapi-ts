import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function zodSymbols(plugin: PluginInstance) {
  return {
    ...SYMBOLS.ZOD(plugin),
  };
}

export type ZodSymbols = ReturnType<typeof zodSymbols>;
