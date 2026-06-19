import type { SymbolFactory } from '@hey-api/shared';

export function TEMPORAL_POLYFILL(factory: SymbolFactory) {
  return {
    Temporal: factory.register('Temporal', {
      external: 'temporal-polyfill',
    }),
  };
}
