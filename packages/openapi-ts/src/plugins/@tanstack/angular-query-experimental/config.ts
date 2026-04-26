import { definePluginConfig, mappers } from '@hey-api/shared';

import { handler } from '../../../plugins/@tanstack/query-core/plugin';
import type { TanStackAngularQueryPlugin } from './types';

export const defaultConfig: TanStackAngularQueryPlugin['Config'] = {
  config: {
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as TanStackAngularQueryPlugin['Handler'],
  name: '@tanstack/angular-query-experimental',
  resolveConfig: (plugin, context) => {
    plugin.config.getQueryData = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: false,
        name: '{{name}}GetQueryData',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ enabled: true, name }),
        object: (fields) => ({ enabled: true, ...fields }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.getQueryData,
    });

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
        exported: true,
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

    plugin.config.setQueryData = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: false,
        name: '{{name}}SetQueryData',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ enabled: true, name }),
        object: (fields) => ({ enabled: true, ...fields }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.setQueryData,
    });
  },
};

/**
 * Type helper for `@tanstack/angular-query-experimental` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
