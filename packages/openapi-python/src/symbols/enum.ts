import type { SymbolFactory } from '@hey-api/shared';

export function ENUM(factory: SymbolFactory) {
  return {
    Enum: factory.register('Enum', { external: 'enum' }),
    IntEnum: factory.register('IntEnum', { external: 'enum' }),
    StrEnum: factory.register('StrEnum', { external: 'enum' }),
  };
}

export type EnumSymbols = ReturnType<typeof ENUM>;
