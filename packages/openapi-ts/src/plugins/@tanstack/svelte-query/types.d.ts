import type { Plugin } from '../../types';
import type { TanStackQuery } from '../query-core/types';

export interface Config
  extends Plugin.Name<'@tanstack/svelte-query'>,
    TanStackQuery.Config {
  /**
   * Generate `createInfiniteQuery()` helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   *
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createmutation `createMutation()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   *
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/svelte-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createquery `createQuery()`} helpers?
   * These will be generated from all requests.
   *
   * @default true
   */
  queryOptions?: boolean;
  /**
   * Generate queries with `throwOnError` option when `true`, queries will throw errors instead of returning them in the error state, allowing for easier error handling with error boundaries.
   *
   * @default true
   */
  throwOnError?: boolean;
}
