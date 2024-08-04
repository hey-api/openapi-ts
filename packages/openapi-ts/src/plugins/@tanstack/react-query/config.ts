export interface PluginTanStackReactQuery {
  /**
   * Generate TanStack React Query output from the provided input.
   */
  name: '@tanstack/react-query';
  /**
   * Name of the generated file.
   * @default 'tanstack-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/latest/docs/framework/react/guides/query-options `queryOptions()`} and {@link https://tanstack.com/query/latest/docs/framework/react/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers?
   * @default true
   */
  queryOptions?: boolean;
}

export const pluginTanStackReactQueryDefaultConfig: Required<PluginTanStackReactQuery> =
  {
    name: '@tanstack/react-query',
    output: '@tanstack/query',
    queryOptions: true,
  };
