import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';
import { definePluginConfig } from '~/plugins/shared/utils/config';

import type { HeyApiClientKyPlugin } from './types';

export const defaultConfig: HeyApiClientKyPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler,
  name: '@hey-api/client-ky',
};

/**
 * Type helper for `@hey-api/client-ky` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
