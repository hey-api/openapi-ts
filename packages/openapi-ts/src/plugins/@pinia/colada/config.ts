import { definePluginConfig } from '../../shared/utils/config';
import { handler } from './plugin';
import type { PiniaColadaPlugin } from './types';

export const defaultConfig: PiniaColadaPlugin['Config'] = {
  config: {
    enableCaching: false,
    enablePaginationOnKey: undefined,
    errorHandling: 'specific',
    exportFromIndex: false,
    groupByTag: false,
    // importPath: PluginName,
    includeTypes: true,
    // name: PluginName,
    // output: PluginName,
    prefixUse: true,
    resolveQuery: undefined,
    resolveQueryKey: undefined,
    suffixQueryMutation: true,
    useInfiniteQueries: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler: handler as PiniaColadaPlugin['Handler'],
  name: '@tanstack/react-query',
  output: '@tanstack/react-query',
  resolveConfig: (plugin, context) => {
    // plugin.config.infiniteQueryKeys = context.valueToObject({
    //   defaultValue: {
    //     case: plugin.config.case ?? 'camelCase',
    //     enabled: true,
    //     name: '{{name}}InfiniteQueryKey',
    //     tags: false,
    //   },
    //   mappers: {
    //     boolean: (enabled) => ({ enabled }),
    //     function: (name) => ({ name }),
    //     string: (name) => ({ name }),
    //   },
    //   value: plugin.config.infiniteQueryKeys,
    // });

    // plugin.config.infiniteQueryOptions = context.valueToObject({
    //   defaultValue: {
    //     case: plugin.config.case ?? 'camelCase',
    //     enabled: true,
    //     meta: false,
    //     name: '{{name}}InfiniteOptions',
    //   },
    //   mappers: {
    //     boolean: (enabled) => ({ enabled }),
    //     function: (name) => ({ name }),
    //     string: (name) => ({ name }),
    //   },
    //   value: plugin.config.infiniteQueryOptions,
    // });

    // plugin.config.mutationOptions = context.valueToObject({
    //   defaultValue: {
    //     case: plugin.config.case ?? 'camelCase',
    //     enabled: true,
    //     meta: false,
    //     name: '{{name}}Mutation',
    //   },
    //   mappers: {
    //     boolean: (enabled) => ({ enabled }),
    //     function: (name) => ({ name }),
    //     string: (name) => ({ name }),
    //   },
    //   value: plugin.config.mutationOptions,
    // });

    // plugin.config.queryKeys = context.valueToObject({
    //   defaultValue: {
    //     case: plugin.config.case ?? 'camelCase',
    //     enabled: true,
    //     name: '{{name}}QueryKey',
    //     tags: false,
    //   },
    //   mappers: {
    //     boolean: (enabled) => ({ enabled }),
    //     function: (name) => ({ name }),
    //     string: (name) => ({ name }),
    //   },
    //   value: plugin.config.queryKeys,
    // });

    // plugin.config.queryOptions = context.valueToObject({
    //   defaultValue: {
    //     case: plugin.config.case ?? 'camelCase',
    //     enabled: true,
    //     meta: false,
    //     name: '{{name}}Options',
    //   },
    //   mappers: {
    //     boolean: (enabled) => ({ enabled }),
    //     function: (name) => ({ name }),
    //     string: (name) => ({ name }),
    //   },
    //   value: plugin.config.queryOptions,
    // });
  },
};

/**
 * Type helper for `@pinia/colada` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
