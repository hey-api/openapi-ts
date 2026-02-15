import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { NestJSPlugin } from './types';

export const defaultConfig: NestJSPlugin['Config'] = {
  config: {
    groupByTag: false,
    includeInEntry: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'nestjs',
  resolveConfig: (plugin) => {
    plugin.config.groupByTag = plugin.config.groupByTag ?? false;
  },
};

/**
 * Type helper for `nestjs` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
