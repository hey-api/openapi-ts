import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { HeyApiClientFetchPlugin } from './types';

export const defaultConfig: Plugin.Config<HeyApiClientFetchPlugin> = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler as Plugin.Handler<HeyApiClientFetchPlugin>,
  name: '@hey-api/client-fetch',
};

/**
 * Type helper for `@hey-api/client-fetch` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
