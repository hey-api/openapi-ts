import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function pydanticSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.PYDANTIC(factory),
    enum: SYMBOLS.ENUM(factory),
    typing: SYMBOLS.TYPING(factory),
  };
}

export type PydanticSymbols = ReturnType<typeof pydanticSymbols>;
