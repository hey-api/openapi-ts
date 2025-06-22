import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { handler } from '../query-core/plugin';
import { handlerLegacy } from '../query-core/plugin-legacy';
import type { TanStackSvelteQueryPlugin } from './types';

export const defaultConfig: Plugin.Config<TanStackSvelteQueryPlugin> = {
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as Plugin.Handler<TanStackSvelteQueryPlugin>,
  handlerLegacy: handlerLegacy as Plugin.Handler<TanStackSvelteQueryPlugin>,
  name: '@tanstack/svelte-query',
  output: '@tanstack/svelte-query',
  resolveConfig: (plugin, context) => {
    plugin.config.infiniteQueryKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}InfiniteQueryKey',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (name) => ({ enabled: true, name }),
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
        string: (name) => ({ enabled: true, name }),
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
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.mutationOptions,
    });

    plugin.config.queryKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}QueryKey',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.queryKeys,
    });

    plugin.config.queryOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Options',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.queryOptions,
    });
  },
};

/**
 * Type helper for `@tanstack/svelte-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
