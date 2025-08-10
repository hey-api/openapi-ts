import { definePluginConfig } from '../../shared/utils/config';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { angularClientPluginHandler } from './plugin';
import type { HeyApiClientAngularPlugin } from './types';

export const defaultConfig: HeyApiClientAngularPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    httpResource: false,
    throwOnError: false,
  },
  handler: angularClientPluginHandler,
  name: '@hey-api/client-angular',
};

/**
 * Type helper for `@hey-api/client-angular` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
