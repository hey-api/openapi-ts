import type { SymbolFactory } from '@hey-api/shared';

export function PINIA_COLADA(factory: SymbolFactory) {
  return {
    UseMutationOptions: factory.register('UseMutationOptions', {
      external: '@pinia/colada',
      kind: 'type',
    }),
    UseQueryOptions: factory.register('UseQueryOptions', {
      external: '@pinia/colada',
      kind: 'type',
    }),
    _JSONValue: factory.register('_JSONValue', {
      external: '@pinia/colada',
      kind: 'type',
    }),
    defineQueryOptions: factory.register('defineQueryOptions', {
      external: '@pinia/colada',
    }),
  };
}
