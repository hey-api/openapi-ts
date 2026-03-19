import { definePluginConfig, mappers } from '@hey-api/shared';

import { handler } from './plugin';
import type { SwrPlugin } from './types';

export const defaultConfig: SwrPlugin['Config'] = {
  config: {
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as SwrPlugin['Handler'],
  name: 'swr',
  resolveConfig: (plugin, context) => {
    plugin.config.infiniteQueryKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}InfiniteQueryKey',
        tags: false,
      },
      mappers,
      value: plugin.config.infiniteQueryKeys,
    });

    plugin.config.infiniteQueryOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}InfiniteOptions',
      },
      mappers,
      value: plugin.config.infiniteQueryOptions,
    });

    plugin.config.mutationOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Mutation',
      },
      mappers,
      value: plugin.config.mutationOptions,
    });

    plugin.config.queryKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}QueryKey',
        tags: false,
      },
      mappers,
      value: plugin.config.queryKeys,
    });

    plugin.config.queryOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        exported: true,
        name: '{{name}}Options',
      },
      mappers,
      value: plugin.config.queryOptions,
    });

    plugin.config.useSwr = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'use{{name}}',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ enabled: true, name }),
        object: (fields) => ({ enabled: true, ...fields }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.useSwr,
    });

    if (plugin.config.useSwr.enabled) {
      // useSwr hooks consume queryOptions
      if (!plugin.config.queryOptions.enabled) {
        plugin.config.queryOptions.enabled = true;
        plugin.config.queryOptions.exported = false;
      }
    }
  },
};

/**
 * Type helper for `swr` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
