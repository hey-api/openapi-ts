import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function pydanticSymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.PYDANTIC(factory),
    datetime: SYMBOLS.DATETIME(factory),
    enum: SYMBOLS.ENUM(factory),
    typing: SYMBOLS.TYPING(factory),
    uuid: SYMBOLS.UUID(factory),
  };
}

export type PydanticSymbols = ReturnType<typeof pydanticSymbols>;
