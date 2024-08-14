import type { PluginDefinition } from '../../types';
import { handler } from '../query-core/plugin';

export interface PluginTanStackSolidQuery extends PluginDefinition {
  /**
   * Generate `createInfiniteQuery()` helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate `createMutation()` helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Generate TanStack Solid Query output from the provided input.
   */
  name: '@tanstack/solid-query';
  /**
   * Name of the generated file.
   * @default '@tanstack/solid-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/solid/reference/createQuery `createQuery()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
}

export const pluginTanStackSolidQueryDefaultConfig: Required<PluginTanStackSolidQuery> =
  {
    handler,
    infiniteQueryOptions: true,
    mutationOptions: true,
    name: '@tanstack/solid-query',
    output: '@tanstack/solid-query',
    queryOptions: true,
  };
