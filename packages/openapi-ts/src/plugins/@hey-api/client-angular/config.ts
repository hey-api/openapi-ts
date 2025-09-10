import { definePluginConfig } from '../../shared/utils/config';
import { clientDefaultConfig, clientDefaultMeta } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import { Api } from './api';
import type { HeyApiClientAngularPlugin } from './types';

export const defaultConfig: HeyApiClientAngularPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api({
    name: '@hey-api/client-angular',
  }),
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler,
  name: '@hey-api/client-angular',
};

/**
 * Type helper for `@hey-api/client-angular` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
