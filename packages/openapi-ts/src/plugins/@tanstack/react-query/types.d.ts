import type { Plugin } from '../../types';
import type { TanStackQuery } from '../query-core/types';

export interface Config
  extends Plugin.Name<'@tanstack/react-query'>,
    TanStackQuery.Config {
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   *
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation `useMutation()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   *
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/react-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions `queryOptions()`} helpers?
   * These will be generated from all requests.
   *
   * @default true
   */
  queryOptions?: boolean;
  /**
   * Generate queries with {@link https://tanstack.com/query/v5/docs/framework/react/guides/query-options#throwonerror `throwOnError`} option when `true`, queries will throw errors instead of returning them in the error state, allowing for easier error handling with error boundaries.
   *
   * @default true
   */
  throwOnError?: boolean;
}
