export type TanstackQueryFlavor =
  | '@tanstack/angular-query-experimental'
  | '@tanstack/react-query'
  | '@tanstack/solid-query'
  | '@tanstack/svelte-query'
  | '@tanstack/vue-query';

export type PluginTanStackQueryConfig<Flavor extends TanstackQueryFlavor> = {
  /**
   * Generate {@link https://tanstack.com/query/latest/docs/framework/react/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://github.com/TanStack/query/blob/0696b514ce71dffc8acb38c55e0c93c43b781146/packages/react-query/src/types.ts#L128-L136 `mutationOptions()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Generate TanStack Query output from the provided input.
   */
  name: Flavor;
  /**
   * Name of the generated file.
   * @default 'tanstack-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/latest/docs/framework/react/guides/query-options `queryOptions()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
};

export const TANSTACK_DEFAULT_QUERY_OPTIONS = true;

export const TANSTACK_DEFAULT_OUTPUT = '@tanstack/query';

export const TANSTACK_DEFAULT_INFINITE_QUERY_OPTIONS = true;

export const TANSTACK_DEFAULT_MUTATION_OPTIONS = true;
