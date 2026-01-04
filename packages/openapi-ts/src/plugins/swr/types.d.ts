import type { DefinePlugin, Plugin } from '~/plugins';
import type { Casing, NameTransformer } from '~/utils/naming';

export type UserConfig = Plugin.Name<'swr'> &
  Plugin.Hooks & {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case?: Casing;
    /**
     * Add comments from SDK functions to the generated SWR code?
     *
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
     * Configuration for generated infinite query options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    infiniteQueryOptions?:
      | boolean
      | NameTransformer
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether to generate infinite query options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom function to generate metadata for the operation.
           * Can return any valid meta object that will be included in the generated infinite query options.
           *
           * @param operation - The operation object containing all available metadata
           * @returns A meta object with any properties you want to include
           *
           * @example
           * ```ts
           * meta: (operation) => ({
           *   customField: operation.id,
           *   isDeprecated: operation.deprecated,
           *   tags: operation.tags,
           *   customObject: {
           *     method: operation.method,
           *     path: operation.path
           *   }
           * })
           * ```
           *
           * @default undefined
           */
          meta?: (operation: IR.OperationObject) => Record<string, unknown>;
          /**
           * Custom naming pattern for generated infinite query options names. The name variable is
           * obtained from the SDK function name.
           *
           * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
           *
           * @default '{{name}}InfiniteOptions'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for generated mutation options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation useMutation}
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    mutationOptions?:
      | boolean
      | NameTransformer
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether to generate mutation options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom function to generate metadata for the operation.
           * Can return any valid meta object that will be included in the generated mutation options.
           *
           * @param operation - The operation object containing all available metadata
           * @returns A meta object with any properties you want to include
           *
           * @example
           * ```ts
           * meta: (operation) => ({
           *   customField: operation.id,
           *   isDeprecated: operation.deprecated,
           *   tags: operation.tags,
           *   customObject: {
           *     method: operation.method,
           *     path: operation.path
           *   }
           * })
           * ```
           *
           * @default undefined
           */
          meta?: (operation: IR.OperationObject) => Record<string, unknown>;
          /**
           * Custom naming pattern for generated mutation options names. The name variable is
           * obtained from the SDK function name.
           *
           * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation useMutation}
           *
           * @default '{{name}}Mutation'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for generated query keys.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryKey queryKey}
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    queryKeys?:
      | boolean
      | NameTransformer
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
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
           * See {@link https://tanstack.com/query/v5/docs/framework/react/guides/query-keys Query Keys}
           *
           * @default '{{name}}QueryKey'
           */
          name?: NameTransformer;
          /**
           * Whether to include operation tags in query keys.
           * This will make query keys larger but provides better cache invalidation capabilities.
           *
           * @default false
           */
          tags?: boolean;
        };
    /**
     * Configuration for generated query options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions queryOptions}
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    queryOptions?:
      | boolean
      | NameTransformer
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether to generate query options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Whether to export generated symbols.
           *
           * @default true
           */
          exported?: boolean;
          /**
           * Custom function to generate metadata for the operation.
           * Can return any valid meta object that will be included in the generated query options.
           *
           * @param operation - The operation object containing all available metadata
           * @returns A meta object with any properties you want to include
           *
           * @example
           * ```ts
           * meta: (operation) => ({
           *   customField: operation.id,
           *   isDeprecated: operation.deprecated,
           *   tags: operation.tags,
           *   customObject: {
           *     method: operation.method,
           *     path: operation.path
           *   }
           * })
           * ```
           *
           * @default undefined
           */
          meta?: (operation: IR.OperationObject) => Record<string, unknown>;
          /**
           * Custom naming pattern for generated query options names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Infinite'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for generated useSWRInfinite options helpers.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrInfiniteOptions?:
      | boolean
      | NameTransformer
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
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
           * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
           *
           * @default '{{name}}InfiniteQueryKey'
           */
          name?: NameTransformer;
          /**
           * Whether to include operation tags in infinite query keys.
           * This will make query keys larger but provides better cache invalidation capabilities.
           *
           * @default false
           */
          tags?: boolean;
        };
    /**
     * Configuration for generated SWR keys.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrKeys?:
      | boolean
      | NameTransformer
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether to generate SWR keys.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated SWR key names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Key'
           */
          name?: StringName;
        };
    /**
     * Configuration for generated useSWRMutation options helpers.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrMutationOptions?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: StringCase;
          /**
           * Whether to generate useSWRMutation options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated useSWRMutation options names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Mutation'
           */
          name?: StringName;
        };
    /**
     * Configuration for generated useSWR options helpers.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrOptions?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: StringCase;
          /**
           * Whether to generate useSWR options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated useSWR options names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Options'
           */
          name?: NameTransformer;
        };
  };

export type Config = Plugin.Name<'swr'> &
  Plugin.Hooks & {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: Casing;
    /**
     * Add comments from SDK functions to the generated SWR code?
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
     * Resolved configuration for generated infinite query options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
     */
    infiniteQueryOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: Casing;
      /**
       * Whether to generate infinite query options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom function to generate metadata for the operation.
       * Can return any valid meta object that will be included in the generated infinite query options.
       *
       * @param operation - The operation object containing all available metadata
       * @returns A meta object with any properties you want to include
       *
       * @example
       * ```ts
       * meta: (operation) => ({
       *   customField: operation.id,
       *   isDeprecated: operation.deprecated,
       *   tags: operation.tags,
       *   customObject: {
       *     method: operation.method,
       *     path: operation.path
       *   }
       * })
       * ```
       *
       * @default undefined
       */
      meta: (operation: IR.OperationObject) => Record<string, unknown>;
      /**
       * Custom naming pattern for generated infinite query options names. The name variable is obtained from the SDK function name.
       *
       * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
       *
       * @default '{{name}}InfiniteOptions'
       */
      name: NameTransformer;
    };
    /**
     * Resolved configuration for generated mutation options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation useMutation}
     */
    mutationOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: Casing;
      /**
       * Whether to generate mutation options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom function to generate metadata for the operation.
       * Can return any valid meta object that will be included in the generated mutation options.
       *
       * @param operation - The operation object containing all available metadata
       * @returns A meta object with any properties you want to include
       *
       * @example
       * ```ts
       * meta: (operation) => ({
       *   customField: operation.id,
       *   isDeprecated: operation.deprecated,
       *   tags: operation.tags,
       *   customObject: {
       *     method: operation.method,
       *     path: operation.path
       *   }
       * })
       * ```
       *
       * @default undefined
       */
      meta: (operation: IR.OperationObject) => Record<string, unknown>;
      /**
       * Custom naming pattern for generated mutation options names. The name variable is obtained from the SDK function name.
       *
       * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation useMutation}
       *
       * @default '{{name}}Mutation'
       */
      name: NameTransformer;
    };
    /**
     * Resolved configuration for generated query keys.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/guides/query-keys Query Keys}
     */
    queryKeys: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: Casing;
      /**
       * Whether to generate query keys.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated query key names. The name variable is obtained from the SDK function name.
       *
       * See {@link https://tanstack.com/query/v5/docs/framework/react/guides/query-keys Query Keys}
       *
       * @default '{{name}}QueryKey'
       */
      name: NameTransformer;
      /**
       * Whether to include operation tags in query keys.
       * This will make query keys larger but provides better cache invalidation capabilities.
       *
       * @default false
       */
      tags: boolean;
    };
    /**
     * Resolved configuration for generated query options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions queryOptions}
     */
    queryOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: Casing;
      /**
       * Whether to generate query options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated useSWRInfinite options names. The name variable is obtained from the SDK function name.
       *
       * @param operation - The operation object containing all available metadata
       * @returns A meta object with any properties you want to include
       *
       * @example
       * ```ts
       * meta: (operation) => ({
       *   customField: operation.id,
       *   isDeprecated: operation.deprecated,
       *   tags: operation.tags,
       *   customObject: {
       *     method: operation.method,
       *     path: operation.path
       *   }
       * })
       * ```
       *
       * @default undefined
       */
      meta: (operation: IR.OperationObject) => Record<string, unknown>;
      /**
       * Custom naming pattern for generated query options names. The name variable is obtained from the SDK function name.
       *
       * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions queryOptions}
       *
       * @default '{{name}}Options'
       */
      name: NameTransformer;
    };
    /**
     * Resolved configuration for generated useSWRInfinite options helpers.
     */
    swrInfiniteOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: Casing;
      /**
       * Whether to generate infinite query key helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated infinite query key names. The name variable is obtained from the SDK function name.
       *
       * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
       *
       * @default '{{name}}InfiniteQueryKey'
       */
      name: NameTransformer;
      /**
       * Whether to include operation tags in infinite query keys.
       * This will make query keys larger but provides better cache invalidation capabilities.
       *
       * @default false
       */
      tags: boolean;
    };
    /**
     * Resolved configuration for generated SWR keys.
     */
    swrKeys: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: Casing;
      /**
       * Whether to generate SWR keys.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated SWR key names. The name variable is obtained from the SDK function name.
       *
       * @default '{{name}}Key'
       */
      name: StringName;
    };
    /**
     * Resolved configuration for generated useSWRMutation options helpers.
     */
    swrMutationOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: StringCase;
      /**
       * Whether to generate useSWRMutation options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated useSWRMutation options names. The name variable is obtained from the SDK function name.
       *
       * @default '{{name}}Mutation'
       */
      name: StringName;
    };
    /**
     * Resolved configuration for generated useSWR options helpers.
     */
    swrOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: StringCase;
      /**
       * Whether to generate useSWR options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated useSWR options names. The name variable is obtained from the SDK function name.
       *
       * @default '{{name}}Options'
       */
      name: NameTransformer;
    };
  };

export type SwrPlugin = DefinePlugin<UserConfig, Config>;
