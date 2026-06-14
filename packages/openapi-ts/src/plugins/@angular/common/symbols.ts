import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function angularSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.ANGULAR(factory),
  };
}

export type AngularSymbols = ReturnType<typeof angularSymbols>;
