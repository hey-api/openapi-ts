import type { PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function fastifyImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  return {
    ...SYMBOLS.FASTIFY(factory),
  };
}

export type FastifyImports = ReturnType<typeof fastifyImports>;
