import type { SymbolFactory } from '@hey-api/shared';

export function UUID(factory: SymbolFactory) {
  return {
    UUID: factory.register('UUID', { external: 'uuid' }),
  };
}

export type UUIDSymbols = ReturnType<typeof UUID>;
