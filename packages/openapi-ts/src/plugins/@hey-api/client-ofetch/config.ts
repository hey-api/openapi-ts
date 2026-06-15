import { definePluginConfig } from '@hey-api/shared';

import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { HeyApiClientOfetchPlugin } from './types';

export const defaultConfig: HeyApiClientOfetchPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler,
  name: '@hey-api/client-ofetch',
  symbolMeta() {
    return {
      artifact: 'client',
    };
  },
};

/**
 * Type helper for `@hey-api/client-ofetch` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
