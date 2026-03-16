import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { NestJsPlugin } from './types';

export const defaultConfig: NestJsPlugin['Config'] = {
  config: {
    includeInEntry: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'nestjs',
};

/**
 * Type helper for `nestjs` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
