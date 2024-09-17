import type { PluginDefinition } from '../../types';

export interface PluginConfig extends PluginDefinition {
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation `useMutation()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Generate TanStack React Query output from the provided input.
   */
  name: '@tanstack/react-query';
  /**
   * Name of the generated file.
   * @default '@tanstack/react-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions `queryOptions()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
}

export interface UserConfig
  extends Pick<
    PluginConfig,
    'infiniteQueryOptions' | 'mutationOptions' | 'output' | 'queryOptions'
  > {}
