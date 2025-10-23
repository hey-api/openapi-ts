import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '~/plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '~/plugins/@hey-api/client-core/plugin';
import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import type { HeyApiClientNextPlugin } from './types';

export const defaultConfig: HeyApiClientNextPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api({
    name: '@hey-api/client-next',
  }),
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler: clientPluginHandler,
  name: '@hey-api/client-next',
};

/**
 * Type helper for `@hey-api/client-next` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
