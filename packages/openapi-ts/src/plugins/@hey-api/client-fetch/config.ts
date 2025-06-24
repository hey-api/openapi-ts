import { definePluginConfig } from '../../shared/utils/config';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { HeyApiClientFetchPlugin } from './types';

export const defaultConfig: HeyApiClientFetchPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler as HeyApiClientFetchPlugin['Handler'],
  name: '@hey-api/client-fetch',
};

/**
 * Type helper for `@hey-api/client-fetch` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
