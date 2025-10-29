import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import { handler } from './plugin';
import type { FastifyPlugin } from './types';

export const defaultConfig: FastifyPlugin['Config'] = {
  api: new Api(),
  config: {
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'fastify',
};

/**
 * Type helper for `fastify` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
