import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { MswPlugin } from './types';

export const defaultConfig: MswPlugin['Config'] = {
  config: {
    baseUrl: '*',
    comments: true,
    includeInEntry: false,
    responseFallback: 'error',
    source: ['@hey-api/examples'],
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'msw',
  resolveConfig: (plugin) => {
    if (!(plugin.config.source instanceof Array)) {
      plugin.config.source = plugin.config.source ? [plugin.config.source] : [];
    }
    for (const source of plugin.config.source) {
      plugin.dependencies.add(source);
    }
  },
  tags: ['handler'],
};

/**
 * Type helper for MSW plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
