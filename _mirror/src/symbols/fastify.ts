import type { SymbolFactory } from '@hey-api/shared';

export function FASTIFY(factory: SymbolFactory) {
  return {
    RouteHandler: factory.register('RouteHandler', {
      external: 'fastify',
      kind: 'type',
    }),
  };
}
