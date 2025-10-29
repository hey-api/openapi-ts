import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';
import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import type { HeyApiClientNuxtPlugin } from './types';

export const defaultConfig: HeyApiClientNuxtPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api(),
  config: clientDefaultConfig,
  handler: clientPluginHandler,
  name: '@hey-api/client-nuxt',
};

/**
 * Type helper for `@hey-api/client-nuxt` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
