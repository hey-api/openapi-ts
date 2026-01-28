import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { HeyApiSchemasPlugin } from './types';

export const defaultConfig: HeyApiSchemasPlugin['Config'] = {
  config: {
    exportFromIndex: false,
    nameBuilder: (name) => `${name}Schema`,
    type: 'json',
  },
  handler,
  name: '@hey-api/schemas',
};

/**
 * Type helper for `@hey-api/schemas` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
