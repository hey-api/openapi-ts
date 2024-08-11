export interface PluginTanStackVueQuery {
  /**
   * Generate {@link https://tanstack.com/query/latest/docs/framework/vue/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * TODO: update link
   * Generate {@link https://github.com/TanStack/query/blob/0696b514ce71dffc8acb38c55e0c93c43b781146/packages/react-query/src/types.ts#L128-L136 `mutationOptions()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
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
   * Generate {@link https://tanstack.com/query/latest/docs/framework/vue/guides/query-options `queryOptions()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
}

export const pluginTanStackVueQueryDefaultConfig: Required<PluginTanStackVueQuery> =
  {
    infiniteQueryOptions: true,
    mutationOptions: true,
    name: '@tanstack/vue-query',
    output: '@tanstack/vue-query',
    queryOptions: true,
  };
