import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function angularImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.ANGULAR(factory),
  };
}

export type AngularImports = ReturnType<typeof angularImports>;
