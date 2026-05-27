import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function pydanticSymbols(plugin: PluginInstance) {
  return {
    ...SYMBOLS.PYDANTIC(plugin),
    enum: SYMBOLS.ENUM(plugin),
    typing: SYMBOLS.TYPING(plugin),
  };
}

export type PydanticSymbols = ReturnType<typeof pydanticSymbols>;
