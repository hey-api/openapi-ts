import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { SwrPlugin } from './types';

const defaultMeta = (): Record<string, unknown> => ({});

export const defaultConfig: SwrPlugin['Config'] = {
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
    infiniteQueryKeys: {
      enabled: true,
      name: '{{name}}InfiniteQueryKey',
      tags: false,
    },
    infiniteQueryOptions: {
      enabled: true,
      meta: defaultMeta,
      name: '{{name}}InfiniteOptions',
    },
    mutationOptions: {
      enabled: true,
      meta: defaultMeta,
      name: '{{name}}Mutation',
    },
    queryKeys: {
      enabled: true,
      name: '{{name}}QueryKey',
      tags: false,
    },
    queryOptions: {
      enabled: true,
      exported: true,
      meta: defaultMeta,
      name: '{{name}}Options',
    },
    useSwr: {
      enabled: true,
      name: 'use{{name}}',
    },
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler,
  name: 'swr',
  resolveConfig(plugin) {
    if (plugin.config.useSwr.enabled && !plugin.config.queryOptions.enabled) {
      plugin.config.queryOptions.enabled = true;
      plugin.config.queryOptions.exported = false;
    }
  },
};

/**
 * Type helper for `swr` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
