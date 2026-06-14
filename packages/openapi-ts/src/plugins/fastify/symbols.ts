import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function fastifySymbols(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.FASTIFY(factory),
  };
}

export type FastifySymbols = ReturnType<typeof fastifySymbols>;
