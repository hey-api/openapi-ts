import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { MswPlugin } from './types';

export const defaultConfig: MswPlugin['Config'] = {
  config: {
    includeInEntry: false,
    valueSources: ['example'],
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'msw',
  tags: ['mocker'],
};

/**
 * Type helper for `msw` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
