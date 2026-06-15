import { definePluginConfig } from '@hey-api/shared';

import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { HeyApiClientAngularPlugin } from './types';

export const defaultConfig: HeyApiClientAngularPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler as unknown as HeyApiClientAngularPlugin['Handler'],
  name: '@hey-api/client-angular',
  symbolMeta() {
    return {
      artifact: 'client',
    };
  },
};

/**
 * Type helper for `@hey-api/client-angular` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
