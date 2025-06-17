import { definePluginConfig } from '../shared/utils/config';
import type { Plugin } from '../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  config: {
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  handlerLegacy: () => {},
  name: 'fastify',
  output: 'fastify',
};

/**
 * Type helper for `fastify` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
