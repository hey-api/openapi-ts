import { definePluginConfig } from '../../shared/utils/config';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import { Api } from './api';
import type { HeyApiClientOfetchPlugin } from './types';

export const defaultConfig: HeyApiClientOfetchPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api({
    name: '@hey-api/client-ofetch',
  }),
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler,
  name: '@hey-api/client-ofetch',
};

/**
 * Type helper for `@hey-api/client-ofetch` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
