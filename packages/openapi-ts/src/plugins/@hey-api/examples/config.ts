import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { HeyApiExamplesPlugin } from './types';

export const defaultConfig: HeyApiExamplesPlugin['Config'] = {
  config: {
    case: 'camelCase',
    includeInEntry: false,
  },
  handler,
  name: '@hey-api/examples',
  resolveConfig: (plugin, context) => {
    plugin.config.case = context.valueToObject({
      defaultValue: 'camelCase' as const,
      value: plugin.config.case,
    });
  },
  tags: ['source'],
};

/**
 * Type helper for `@hey-api/examples` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
