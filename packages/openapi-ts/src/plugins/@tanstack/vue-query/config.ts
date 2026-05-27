import { definePluginConfig } from '@hey-api/shared';

import { handler } from '../../../plugins/@tanstack/query-core/plugin';
import { tanStackQuerySymbols } from '../query-core/symbols';
import type { TanStackVueQueryPlugin } from './types';

const defaultMeta = (): Record<string, unknown> => ({});

export const defaultConfig: TanStackVueQueryPlugin['Config'] = {
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
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler,
  name: '@tanstack/vue-query',
  symbols: tanStackQuerySymbols,
};

/**
 * Type helper for `@tanstack/vue-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
