import type { SymbolFactory } from '@hey-api/shared';

export function ORPC_CONTRACT(factory: SymbolFactory) {
  return {
    oc: factory.register('oc', {
      external: '@orpc/contract',
    }),
  };
}
