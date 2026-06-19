import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function zodImports(plugin: PluginInstance) {
  return {
    ...SYMBOLS.ZOD(plugin),
  };
}

export type ZodImports = ReturnType<typeof zodImports>;
