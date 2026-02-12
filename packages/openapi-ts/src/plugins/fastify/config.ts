import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { FastifyPlugin } from './types';

export const defaultConfig: FastifyPlugin['Config'] = {
  config: {
    includeInEntry: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'fastify',
};

/**
 * Type helper for `fastify` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
