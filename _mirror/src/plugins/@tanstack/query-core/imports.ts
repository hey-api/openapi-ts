import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function tanStackQueryImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.TANSTACK_QUERY(plugin),
    axios: SYMBOLS.AXIOS(factory),
  };
}

export type TanStackQueryImports = ReturnType<typeof tanStackQueryImports>;
