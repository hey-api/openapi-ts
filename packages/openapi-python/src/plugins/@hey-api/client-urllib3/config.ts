import { definePluginConfig } from '@hey-api/shared';

import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import type { HeyApiClientUrllib3Plugin } from './types';

export const defaultConfig: HeyApiClientUrllib3Plugin['Config'] = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler() {
    // TODO: handler
  },
  name: '@hey-api/client-urllib3',
  symbolMeta() {
    return {
      artifact: 'client',
    };
  },
};

/**
 * Type helper for `@hey-api/client-urllib3` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
