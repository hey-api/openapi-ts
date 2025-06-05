import type { Plugin } from '../../types';
import type { TanStackQuery } from '../query-core/types';

export interface Config
  extends Plugin.Name<'@tanstack/solid-query'>,
    TanStackQuery.Config {
  /**
   * Generate `createInfiniteQuery()` helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   *
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate `createMutation()` helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   *
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/solid-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/solid/reference/createQuery `createQuery()`} helpers?
   * These will be generated from all requests.
   *
   * @default true
   */
  queryOptions?: boolean;
  /**
   * Generate queries with `throwOnError` option enabled? When enabled, queries will throw errors instead of returning them in the error state, allowing for easier error handling with error boundaries.
   *
   * @default true
   */
  throwOnError?: boolean;
}
