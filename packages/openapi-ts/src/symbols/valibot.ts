import type { SymbolFactory } from '@hey-api/shared';

export function VALIBOT(factory: SymbolFactory) {
  return {
    v: factory.register('v', {
      external: 'valibot',
      importKind: 'namespace',
    }),
  };
}
