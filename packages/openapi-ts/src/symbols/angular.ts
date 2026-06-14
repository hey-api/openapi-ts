import type { SymbolFactory } from '@hey-api/shared';

export function ANGULAR(factory: SymbolFactory) {
  return {
    HttpRequest: factory.register('HttpRequest', {
      external: '@angular/common/http',
      kind: 'type',
    }),
    Injectable: factory.register('Injectable', {
      external: '@angular/core',
    }),
    httpResource: factory.register('httpResource', {
      external: '@angular/common/http',
    }),
    inject: factory.register('inject', {
      external: '@angular/core',
    }),
  };
}
