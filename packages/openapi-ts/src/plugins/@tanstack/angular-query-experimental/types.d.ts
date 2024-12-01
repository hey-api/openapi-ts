import type { Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'@tanstack/angular-query-experimental'> {
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/angular/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/angular/reference/useMutation `useMutation()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Name of the generated file.
   * @default '@tanstack/angular-query-experimental'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/angular/reference/queryOptions `queryOptions()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
}
