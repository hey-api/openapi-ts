import { definePluginConfig } from '../../shared/utils/config';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from './plugin';
import type { HeyApiClientNestjsPlugin } from './types';

export const defaultConfig: HeyApiClientNestjsPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    clientName: 'Api',
    throwOnError: false,
  },
  handler: clientPluginHandler as HeyApiClientNestjsPlugin['Handler'],
  name: '@hey-api/client-nestjs',
};

/**
 * Type helper for `@hey-api/client-nestjs` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
