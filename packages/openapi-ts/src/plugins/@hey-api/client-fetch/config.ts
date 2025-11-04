import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';
import { definePluginConfig } from '~/plugins/shared/utils/config';

import type { HeyApiClientFetchPlugin } from './types';

export const defaultConfig: HeyApiClientFetchPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler,
  name: '@hey-api/client-fetch',
};

/**
 * Type helper for `@hey-api/client-fetch` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
