import type { SymbolFactory } from '@hey-api/shared';

export function ENUM(factory: SymbolFactory) {
  return {
    Enum: factory.register('Enum', { external: 'enum' }),
  };
}

export type EnumSymbols = ReturnType<typeof ENUM>;
