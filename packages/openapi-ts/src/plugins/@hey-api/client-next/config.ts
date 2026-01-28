import { definePluginConfig } from '@hey-api/shared';

import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';

import type { HeyApiClientNextPlugin } from './types';

export const defaultConfig: HeyApiClientNextPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler as unknown as HeyApiClientNextPlugin['Handler'],
  name: '@hey-api/client-next',
};

/**
 * Type helper for `@hey-api/client-next` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
