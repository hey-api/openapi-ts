import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiSchemasPlugin } from './types';

export const defaultConfig: HeyApiSchemasPlugin['Config'] = {
  api: new Api(),
  config: {
    exportFromIndex: false,
    nameBuilder: (name) => `${name}Schema`,
    type: 'json',
  },
  handler,
  handlerLegacy,
  name: '@hey-api/schemas',
};

/**
 * Type helper for `@hey-api/schemas` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
