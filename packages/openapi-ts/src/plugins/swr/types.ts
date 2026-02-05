import type {
  Casing,
  DefinePlugin,
  FeatureToggle,
  IR,
  NameTransformer,
  NamingOptions,
  Plugin,
} from '@hey-api/shared';

export type UserConfig = Plugin.Name<'swr'> &
  Plugin.Hooks &
  Plugin.UserExports & {
    /**
     * Casing convention for generated names.
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
     * Configuration for generated infinite query key helpers.
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
    infiniteQueryKeys?:
      | boolean
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
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
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
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
           * Naming pattern for generated names.
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
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
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
           * Naming pattern for generated names.
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
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
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
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
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
           * Naming pattern for generated names.
           *
           * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions queryOptions}
           *
           * @default '{{name}}Options'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for generated `useSwr()` function helpers.
     *
     * See {@link https://swr.vercel.app/docs/api API}
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    useSwr?:
      | boolean
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
           *
           * See {@link https://swr.vercel.app/docs/api API}
           *
           * @default 'use{{name}}'
           */
          name?: NameTransformer;
        };
  };

export type Config = Plugin.Name<'swr'> &
  Plugin.Hooks &
  Plugin.Exports & {
    /**
     * Casing convention for generated names.
     */
    case: Casing;
    /**
     * Add comments from SDK functions to the generated SWR code?
     *
     * @default true
     */
    comments: boolean;
    /**
     * Resolved configuration for generated infinite query key helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
     */
    infiniteQueryKeys: NamingOptions &
      FeatureToggle & {
        /**
         * Whether to include operation tags in infinite query keys.
         * This will make query keys larger but provides better cache invalidation capabilities.
         *
         * @default false
         */
        tags: boolean;
      };
    /**
     * Resolved configuration for generated infinite query options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/infiniteQueryOptions infiniteQueryOptions}
     */
    infiniteQueryOptions: NamingOptions &
      FeatureToggle & {
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
      };
    /**
     * Resolved configuration for generated mutation options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/reference/useMutation useMutation}
     */
    mutationOptions: NamingOptions &
      FeatureToggle & {
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
      };
    /**
     * Resolved configuration for generated query keys.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/guides/query-keys Query Keys}
     */
    queryKeys: NamingOptions &
      FeatureToggle & {
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
    queryOptions: NamingOptions &
      FeatureToggle & {
        /**
         * Whether to export generated symbols.
         *
         * @default true
         */
        exported: boolean;
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
        meta: (operation: IR.OperationObject) => Record<string, unknown>;
      };
    /**
     * Configuration for generated `useSwr()` function helpers.
     *
     * See {@link https://swr.vercel.app/docs/api API}
     */
    useSwr: NamingOptions & FeatureToggle;
  };

export type SwrPlugin = DefinePlugin<UserConfig, Config>;
