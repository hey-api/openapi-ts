import { definePluginConfig } from '@hey-api/shared';

import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import type { HeyApiClientAiohttpPlugin } from './types';

export const defaultConfig: HeyApiClientAiohttpPlugin['Config'] = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler() {
    // TODO: handler
  },
  name: '@hey-api/client-aiohttp',
  symbolMeta() {
    return {
      artifact: 'client',
    };
  },
};

/**
 * Type helper for `@hey-api/client-aiohttp` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
