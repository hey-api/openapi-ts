import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function pydanticSymbols(plugin: PluginInstance) {
  return {
    ...SYMBOLS.PYDANTIC(plugin.symbolFactory),
    enum: SYMBOLS.ENUM(plugin.symbolFactory),
    typing: SYMBOLS.TYPING(plugin.symbolFactory),
  };
}

export type PydanticSymbols = ReturnType<typeof pydanticSymbols>;
