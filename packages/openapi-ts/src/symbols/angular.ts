import type { SymbolFactory } from '@hey-api/shared';

export function ANGULAR(factory: SymbolFactory) {
  return {
    Injectable: factory.register('Injectable', {
      external: '@angular/core',
    }),
  };
}
