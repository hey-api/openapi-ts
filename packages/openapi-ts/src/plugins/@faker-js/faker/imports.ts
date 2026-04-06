import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../../symbols';

export function fakerImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  // @ts-expect-error
  const locale = plugin.config.locale as string | undefined;
  return {
    ...SYMBOLS.FAKER(factory, locale),
  };
}

export type FakerImports = ReturnType<typeof fakerImports>;
