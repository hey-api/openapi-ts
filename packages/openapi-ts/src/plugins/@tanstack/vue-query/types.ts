import type { PluginHandler } from '../../types';

interface Config {
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/vue/reference/useMutation `useMutation()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Generate TanStack Vue Query output from the provided input.
   */
  name: '@tanstack/vue-query';
  /**
   * Name of the generated file.
   * @default '@tanstack/vue-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/vue/guides/query-options `queryOptions()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
}

export interface PluginConfig extends Config {
  handler: PluginHandler<Config>;
}

export interface UserConfig extends Omit<Config, 'output'> {}
