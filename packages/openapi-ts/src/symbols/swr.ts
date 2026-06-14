import type { SymbolFactory } from '@hey-api/shared';

export function SWR(factory: SymbolFactory) {
  return {
    useSWR: factory.register('useSWR', {
      external: 'swr',
      importKind: 'default',
      kind: 'function',
    }),
  };
}
