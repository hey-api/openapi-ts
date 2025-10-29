import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';
import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import type { HeyApiClientAngularPlugin } from './types';

export const defaultConfig: HeyApiClientAngularPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api(),
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
