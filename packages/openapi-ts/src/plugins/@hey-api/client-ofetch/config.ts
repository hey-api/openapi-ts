import { definePluginConfig } from '@hey-api/shared';

import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';

import type { HeyApiClientOfetchPlugin } from './types';

export const defaultConfig: HeyApiClientOfetchPlugin['Config'] = {
  ...clientDefaultMeta,
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
