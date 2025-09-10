import { definePluginConfig } from '../../shared/utils/config';
import { handler } from '../query-core/plugin';
import { handlerLegacy } from '../query-core/plugin-legacy';
import { Api } from './api';
import type { TanStackSolidQueryPlugin } from './types';

export const defaultConfig: TanStackSolidQueryPlugin['Config'] = {
  api: new Api({
    name: '@tanstack/solid-query',
  }),
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as TanStackSolidQueryPlugin['Handler'],
  handlerLegacy: handlerLegacy as TanStackSolidQueryPlugin['LegacyHandler'],
  name: '@tanstack/solid-query',
  output: '@tanstack/solid-query',
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
  },
};

/**
 * Type helper for `@tanstack/solid-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
