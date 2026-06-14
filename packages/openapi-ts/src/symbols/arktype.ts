import type { SymbolFactory } from '@hey-api/shared';

export function ARKTYPE(factory: SymbolFactory) {
  return {
    type: factory.register('type', {
      external: 'arktype',
    }),
  };
}
