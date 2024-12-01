import type { Plugin } from '../../types';

export interface Config extends Plugin.Name<'@tanstack/svelte-query'> {
  /**
   * Generate `createInfiniteQuery()` helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createmutation `createMutation()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Name of the generated file.
   * @default '@tanstack/svelte-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createquery `createQuery()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
}
