import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import { fastifySymbols } from './symbols';
import type { FastifyPlugin } from './types';

export const defaultConfig: FastifyPlugin['Config'] = {
  config: {
    includeInEntry: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'fastify',
  symbolMeta() {
    return {
      tool: 'fastify',
    };
  },
  symbols: fastifySymbols,
};

/**
 * Type helper for `fastify` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
