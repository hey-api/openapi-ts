import { definePluginConfig } from '@hey-api/shared';

import { handler } from '../../../plugins/@tanstack/query-core/plugin';
import { tanStackQuerySymbols } from '../query-core/symbols';
import type { TanStackPreactQueryPlugin } from './types';

const defaultMeta = (): Record<string, unknown> => ({});

export const defaultConfig: TanStackPreactQueryPlugin['Config'] = {
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    comments: true,
    getQueryData: {
      enabled: false,
      name: '{{name}}GetQueryData',
    },
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
    mutationKeys: {
      enabled: false,
      name: '{{name}}MutationKey',
      tags: false,
    },
    mutationOptions: {
      enabled: true,
      exported: true,
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
    setQueryData: {
      enabled: false,
      name: '{{name}}SetQueryData',
    },
    useGetQueryData: {
      enabled: false,
      name: 'use{{name}}GetQueryData',
    },
    useMutation: {
      enabled: false,
      name: 'use{{name}}Mutation',
    },
    useQuery: {
      enabled: false,
      name: 'use{{name}}Query',
    },
    useSetQueryData: {
      enabled: false,
      name: 'use{{name}}SetQueryData',
    },
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler,
  name: '@tanstack/preact-query',
  resolveConfig(plugin) {
    if (plugin.config.useMutation.enabled && !plugin.config.mutationOptions.enabled) {
      plugin.config.mutationOptions.enabled = true;
      plugin.config.mutationOptions.exported = false;
    }

    if (plugin.config.useQuery.enabled && !plugin.config.queryOptions.enabled) {
      plugin.config.queryOptions.enabled = true;
      plugin.config.queryOptions.exported = false;
    }
  },
  symbols: tanStackQuerySymbols,
};

/**
 * Type helper for `@tanstack/preact-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
