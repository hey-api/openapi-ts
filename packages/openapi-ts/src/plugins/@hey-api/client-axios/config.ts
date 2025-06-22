import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { HeyApiClientAxiosPlugin } from './types';

export const defaultConfig: Plugin.Config<HeyApiClientAxiosPlugin> = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler as Plugin.Handler<HeyApiClientAxiosPlugin>,
  name: '@hey-api/client-axios',
};

/**
 * Type helper for `@hey-api/client-axios` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
