import { definePluginConfig } from '@hey-api/shared';

import {
  clientDefaultConfig,
  clientDefaultMeta,
} from '../../../plugins/@hey-api/client-core/config';
import { clientPluginHandler } from '../../../plugins/@hey-api/client-core/plugin';
import type { HeyApiClientAngularPlugin } from './types';

export const defaultConfig: HeyApiClientAngularPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    throwOnError: false,
  },
  handler:
    clientPluginHandler as unknown as HeyApiClientAngularPlugin['Handler'],
  name: '@hey-api/client-angular',
};

/**
 * Type helper for `@hey-api/client-angular` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
