import { defineNormalizers, definePluginConfig } from '@hey-api/shared';

import { handler } from '../../../plugins/@tanstack/query-core/plugin';
import type { TanStackSvelteQueryPlugin } from './types';

const defaultMeta = (): Record<string, unknown> => ({});

const normalizeConfig = defineNormalizers<
  TanStackSvelteQueryPlugin['Types']['resolvedConfig'],
  TanStackSvelteQueryPlugin['Config']['config']
>((c) => {
  const casing = c.case ?? 'camelCase';
  return {
    getQueryData: {
      case: casing,
      enabled: false,
      name: '{{name}}GetQueryData',
    },
    infiniteQueryKeys: {
      case: casing,
      enabled: true,
      name: '{{name}}InfiniteQueryKey',
      tags: false,
    },
    infiniteQueryOptions: {
      case: casing,
      enabled: true,
      meta: defaultMeta,
      name: '{{name}}InfiniteOptions',
    },
    mutationKeys: {
      case: casing,
      enabled: false,
      name: '{{name}}MutationKey',
      tags: false,
    },
    mutationOptions: {
      case: casing,
      enabled: true,
      exported: true,
      meta: defaultMeta,
      name: '{{name}}Mutation',
    },
    queryKeys: {
      case: casing,
      enabled: true,
      name: '{{name}}QueryKey',
      tags: false,
    },
    queryOptions: {
      case: casing,
      enabled: true,
      exported: true,
      meta: defaultMeta,
      name: '{{name}}Options',
    },
    setQueryData: {
      case: casing,
      enabled: false,
      name: '{{name}}SetQueryData',
    },
  };
});

export const defaultConfig: TanStackSvelteQueryPlugin['Config'] = {
  config: {
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as TanStackSvelteQueryPlugin['Handler'],
  name: '@tanstack/svelte-query',
  resolveConfig: (plugin, context) => {
    normalizeConfig(plugin.config, context);
  },
};

/**
 * Type helper for `@tanstack/svelte-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
