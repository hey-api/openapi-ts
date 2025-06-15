import { definePluginConfig } from '../shared/utils/config';
import type { Plugin } from '../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: () => {},
  config: {
    exportFromIndex: false,
  },
  name: 'fastify',
  output: 'fastify',
};

/**
 * Type helper for `fastify` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
