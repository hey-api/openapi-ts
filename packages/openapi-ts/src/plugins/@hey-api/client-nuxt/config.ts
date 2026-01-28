import { definePluginConfig } from '@hey-api/shared';

import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';

import type { HeyApiClientNuxtPlugin } from './types';

export const defaultConfig: HeyApiClientNuxtPlugin['Config'] = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler: clientPluginHandler as unknown as HeyApiClientNuxtPlugin['Handler'],
  name: '@hey-api/client-nuxt',
};

/**
 * Type helper for `@hey-api/client-nuxt` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
