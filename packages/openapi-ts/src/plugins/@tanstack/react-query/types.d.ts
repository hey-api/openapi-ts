import type { StringCase } from '../../../types/case';
import type { DefinePlugin, Plugin } from '../../types';

export type Config = Plugin.Name<'@tanstack/react-query'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case?: StringCase;
  /**
   * Add comments from SDK functions to the generated TanStack Query code?
   * Duplicating comments this way is useful so you don't need to drill into
   * the underlying SDK function to learn what it does or whether it's
   * deprecated. You can set this option to `false` if you prefer less
   * comment duplication.
   *
   * @default true
   */
  comments?: boolean;
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Configuration for generated infinite query key helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions TanStack Query: infiniteQueryOptions}
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  infiniteQueryKeys?:
    | boolean
    | string
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate infinite query key helpers.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated infinite query key names. The name variable is
         * obtained from the SDK function name.
         *
         * @default '{{name}}InfiniteQueryKey'
         * @see https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions
         */
        name?: string | ((name: string) => string);
      };
  /**
   * Configuration for generated infinite query options helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions TanStack Query: infiniteQueryOptions}
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  infiniteQueryOptions?:
    | boolean
    | string
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate infinite query options helpers.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated infinite query options names. The name variable is
         * obtained from the SDK function name.
         *
         * @default '{{name}}InfiniteOptions'
         * @see https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions
         */
        name?: string | ((name: string) => string);
      };
  /**
   * Configuration for generated mutation options helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation TanStack Query: useMutation}
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  mutationOptions?:
    | boolean
    | string
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate mutation options helpers.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated mutation options names. The name variable is
         * obtained from the SDK function name.
         *
         * @default '{{name}}Mutation'
         * @see https://tanstack.com/query/v5/docs/framework/react/reference/useMutation
         */
        name?: string | ((name: string) => string);
      };
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/react-query'
   */
  output?: string;
  /**
   * Configuration for generated query keys.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryKey TanStack Query: queryKey}
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  queryKeys?:
    | boolean
    | string
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate query keys.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated query key names. The name variable is
         * obtained from the SDK function name.
         *
         * @default '{{name}}QueryKey'
         * @see https://tanstack.com/query/v5/docs/framework/react/reference/queryKey
         */
        name?: string | ((name: string) => string);
      };
  /**
   * Configuration for generated query options helpers.
   *
   * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions TanStack Query: queryOptions}
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  queryOptions?:
    | boolean
    | string
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate query options helpers.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated query options names. The name variable is
         * obtained from the SDK function name.
         *
         * @default '{{name}}Options'
         * @see https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions
         */
        name?: string | ((name: string) => string);
      };
};

export type ResolvedConfig = Plugin.Name<'@tanstack/react-query'> & {
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
   * @see https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions
   */
  infiniteQueryKeys: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate infinite query key helpers.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated infinite query key names. The name variable is obtained from the SDK function name.
     *
     * @default '{{name}}InfiniteQueryKey'
     * @see https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions
     */
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated infinite query options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions
   */
  infiniteQueryOptions: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate infinite query options helpers.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated infinite query options names. The name variable is obtained from the SDK function name.
     *
     * @default '{{name}}InfiniteOptions'
     * @see https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions
     */
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated mutation options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/react/reference/useMutation
   */
  mutationOptions: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate mutation options helpers.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated mutation options names. The name variable is obtained from the SDK function name.
     *
     * @default '{{name}}Mutation'
     * @see https://tanstack.com/query/v5/docs/framework/react/reference/useMutation
     */
    name: string | ((name: string) => string);
  };
  /**
   * Name of the generated file.
   *
   * @default '@tanstack/react-query'
   */
  output: string;
  /**
   * Resolved configuration for generated query keys.
   *
   * @see https://tanstack.com/query/v5/docs/framework/react/reference/queryKey
   */
  queryKeys: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate query keys.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated query key names. The name variable is obtained from the SDK function name.
     *
     * @default '{{name}}QueryKey'
     * @see https://tanstack.com/query/v5/docs/framework/react/reference/queryKey
     */
    name: string | ((name: string) => string);
  };
  /**
   * Resolved configuration for generated query options helpers.
   *
   * @see https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions
   */
  queryOptions: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate query options helpers.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated query options names. The name variable is obtained from the SDK function name.
     *
     * @default '{{name}}Options'
     * @see https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions
     */
    name: string | ((name: string) => string);
  };
};

export type TanStackReactQueryPlugin = DefinePlugin<Config, ResolvedConfig>;
