import { definePluginConfig } from '../../shared/utils/config';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { HeyApiClientNuxtPlugin } from './types';

export const defaultConfig: HeyApiClientNuxtPlugin['Config'] = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler: clientPluginHandler as HeyApiClientNuxtPlugin['Handler'],
  name: '@hey-api/client-nuxt',
};

/**
 * Type helper for `@hey-api/client-nuxt` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
