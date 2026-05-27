import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function pydanticSymbols(plugin: PluginInstance) {
  return {
    enum: SYMBOLS.ENUM(plugin),
    pydantic: SYMBOLS.PYDANTIC(plugin),
    typing: SYMBOLS.TYPING(plugin),
  };
}

export type PydanticSymbols = ReturnType<typeof pydanticSymbols>;
