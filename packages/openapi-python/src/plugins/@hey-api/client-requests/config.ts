import { definePluginConfig } from '@hey-api/shared';

import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import type { HeyApiClientRequestsPlugin } from './types';

export const defaultConfig: HeyApiClientRequestsPlugin['Config'] = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler() {
    // TODO: handler
  },
  name: '@hey-api/client-requests',
  symbolMeta() {
    return {
      artifact: 'client',
    };
  },
};

/**
 * Type helper for `@hey-api/client-requests` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
