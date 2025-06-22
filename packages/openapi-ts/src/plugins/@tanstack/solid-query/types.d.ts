import type { StringCase } from '../../../types/case';
import type { Plugin } from '../../types';

export type Config = Plugin.Name<'@tanstack/solid-query'> & {
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
   * See {@link https://tanstack.com/query/v5/docs/framework/solid/reference/createInfiniteQuery}
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
   * See {@link https://tanstack.com/query/v5/docs/framework/solid/reference/createInfiniteQuery}
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
   * See {@link https://tanstack.com/query/v5/docs/framework/solid/reference/createMutation}
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
   * @default '@tanstack/solid-query'
   */
  output?: string;
  /**
   * Configuration for generated query keys.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/solid/reference/queryKey}
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
   * See {@link https://tanstack.com/query/v5/docs/framework/solid/reference/createQuery}
   */
  queryOptions?:
    | boolean
    | string
    | {
        case?: StringCase;
        enabled?: boolean;
        name?: string | ((name: string) => string);
      };
};

export type ResolvedConfig = Plugin.Name<'@tanstack/solid-query'> & {
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
   * @see https://tanstack.com/query/v5/docs/framework/solid/reference/createInfiniteQuery
   */
  infiniteQueryKeys: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated infinite query options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/solid/reference/createInfiniteQuery
   */
  infiniteQueryOptions: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated mutation options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/solid/reference/createMutation
   */
  mutationOptions: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/solid-query'
   */
  output: string;
  /**
   * Resolved configuration for generated query keys.
   *
   * @see https://tanstack.com/query/v5/docs/framework/solid/reference/queryKey
   */
  queryKeys: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated query options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/solid/reference/createQuery
   */
  queryOptions: {
    case: StringCase;
    enabled: boolean;
    name: string | ((name: string) => string);
  };
};

export type TanStackSolidQueryPlugin = Plugin.Types<Config, ResolvedConfig>;
