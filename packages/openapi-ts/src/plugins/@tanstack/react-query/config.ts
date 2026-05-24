import { defineNormalizers, definePluginConfig } from '@hey-api/shared';

import { handler } from '../../../plugins/@tanstack/query-core/plugin';
import type { TanStackReactQueryPlugin } from './types';

const defaultMeta = (): Record<string, unknown> => ({});

const normalizeConfig = defineNormalizers<
  TanStackReactQueryPlugin['Types']['resolvedConfig'],
  TanStackReactQueryPlugin['Config']['config']
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
    useGetQueryData: {
      case: casing,
      enabled: false,
      name: 'use{{name}}GetQueryData',
    },
    useMutation: {
      case: casing,
      enabled: false,
      name: 'use{{name}}Mutation',
    },
    useQuery: {
      case: casing,
      enabled: false,
      name: 'use{{name}}Query',
    },
    useSetQueryData: {
      case: casing,
      enabled: false,
      name: 'use{{name}}SetQueryData',
    },
  };
});

export const defaultConfig: TanStackReactQueryPlugin['Config'] = {
  config: {
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as TanStackReactQueryPlugin['Handler'],
  name: '@tanstack/react-query',
  resolveConfig: (plugin, context) => {
    const config = normalizeConfig(plugin.config, context);

    if (config.useMutation.enabled && !config.mutationOptions.enabled) {
      config.mutationOptions.enabled = true;
      config.mutationOptions.exported = false;
    }

    if (config.useQuery.enabled && !config.queryOptions.enabled) {
      config.queryOptions.enabled = true;
      config.queryOptions.exported = false;
    }
  },
};

/**
 * Type helper for `@tanstack/react-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
