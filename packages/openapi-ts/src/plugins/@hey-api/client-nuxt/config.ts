import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  ...clientDefaultMeta,
  _handler: clientPluginHandler,
  config: clientDefaultConfig,
  name: '@hey-api/client-nuxt',
};

/**
 * Type helper for `@hey-api/client-nuxt` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
