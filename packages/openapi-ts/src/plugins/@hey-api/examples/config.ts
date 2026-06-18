import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { HeyApiExamplesPlugin } from './types';

export const defaultConfig: HeyApiExamplesPlugin['Config'] = {
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    includeInEntry: false,
  },
  handler,
  name: '@hey-api/examples',
  tags: ['source'],
};

/**
 * Type helper for `@hey-api/examples` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
