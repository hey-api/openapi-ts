import type { StringCase } from '../../../types/config';
import type { Plugin } from '../../types';

export interface Config extends Plugin.Name<'@tanstack/svelte-query'> {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case?: StringCase;
  /**
   * Add comments from SDK functions to the generated TanStack Query code?
   *
   * @default true
   */
  comments?: boolean;
  /**
   * Should the exports from the generated files be re-exported in the index barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Configuration for generated infinite query key helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/createInfiniteQuery}
   */
  infiniteQueryKeys?:
    | boolean
    | string
    | {
        case?: StringCase;
        enabled?: boolean;
        name?: string | ((name: string) => string);
      };
  /**
   * Configuration for generated infinite query options helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/createInfiniteQuery}
   */
  infiniteQueryOptions?:
    | boolean
    | string
    | {
        case?: StringCase;
        enabled?: boolean;
        name?: string | ((name: string) => string);
      };
  /**
   * Configuration for generated mutation options helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/createMutation}
   */
  mutationOptions?:
    | boolean
    | string
    | {
        case?: StringCase;
        enabled?: boolean;
        name?: string | ((name: string) => string);
      };
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/svelte-query'
   */
  output?: string;
  /**
   * Configuration for generated query keys.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/queryKey}
   */
  queryKeys?:
    | boolean
    | string
    | {
        case?: StringCase;
        enabled?: boolean;
        name?: string | ((name: string) => string);
      };
  /**
   * Configuration for generated query options helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/createQuery}
   */
  queryOptions?:
    | boolean
    | string
    | {
        case?: StringCase;
        enabled?: boolean;
        name?: string | ((name: string) => string);
      };
}

export interface ResolvedConfig extends Plugin.Name<'@tanstack/svelte-query'> {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case: StringCase;
  /**
   * Add comments from SDK functions to the generated TanStack Query code?
   *
   * @default true
   */
  comments: boolean;
  /**
   * Should the exports from the generated files be re-exported in the index barrel file?
   *
   * @default false
   */
  exportFromIndex: boolean;
  /**
   * Resolved configuration for generated infinite query key helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/createInfiniteQuery
   */
  infiniteQueryKeys: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated infinite query options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/createInfiniteQuery
   */
  infiniteQueryOptions: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated mutation options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/createMutation
   */
  mutationOptions: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/svelte-query'
   */
  output: string;
  /**
   * Resolved configuration for generated query keys.
   *
   * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/queryKey
   */
  queryKeys: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated query options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/createQuery
   */
  queryOptions: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
}
