import { handler } from '~/plugins/@tanstack/query-core/plugin';
import { handlerLegacy } from '~/plugins/@tanstack/query-core/plugin-legacy';
import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import type { TanStackReactQueryPlugin } from './types';

export const defaultConfig: TanStackReactQueryPlugin['Config'] = {
  api: new Api(),
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as TanStackReactQueryPlugin['Handler'],
  handlerLegacy: handlerLegacy as TanStackReactQueryPlugin['LegacyHandler'],
  name: '@tanstack/react-query',
  output: '@tanstack/react-query',
  resolveConfig: (plugin, context) => {
    plugin.config.infiniteQueryKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}InfiniteQueryKey',
        tags: false,
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.infiniteQueryKeys,
    });

    plugin.config.infiniteQueryOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}InfiniteOptions',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.infiniteQueryOptions,
    });

    plugin.config.mutationOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Mutation',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.mutationOptions,
    });

    plugin.config.queryKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}QueryKey',
        tags: false,
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.queryKeys,
    });

    plugin.config.queryOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        exported: true,
        name: '{{name}}Options',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.queryOptions,
    });

    plugin.config.useQuery = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: false,
        name: 'use{{name}}Query',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ enabled: true, name }),
        object: (fields) => ({ enabled: true, ...fields }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.useQuery,
    });

    if (plugin.config.useQuery.enabled) {
      // useQuery hooks consume queryOptions
      if (!plugin.config.queryOptions.enabled) {
        plugin.config.queryOptions.enabled = true;
        plugin.config.queryOptions.exported = false;
      }
    }
  },
};

/**
 * Type helper for `@tanstack/react-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
