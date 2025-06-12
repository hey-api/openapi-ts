import type { Plugin } from '../../types';
import { handler } from '../query-core/plugin';
import { handlerLegacy } from '../query-core/plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  comments: true,
  exportFromIndex: false,
  infiniteQueryKeyNameBuilder: '{{name}}InfiniteQueryKey',
  infiniteQueryOptions: true,
  infiniteQueryOptionsNameBuilder: '{{name}}InfiniteOptions',
  mutationOptions: true,
  mutationOptionsNameBuilder: '{{name}}Mutation',
  name: '@tanstack/vue-query',
  output: '@tanstack/vue-query',
  queryKeyNameBuilder: '{{name}}QueryKey',
  queryOptions: true,
  queryOptionsNameBuilder: '{{name}}Options',
};

/**
 * Type helper for `@tanstack/vue-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
