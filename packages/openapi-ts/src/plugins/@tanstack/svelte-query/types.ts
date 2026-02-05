import type {
  Casing,
  DefinePlugin,
  FeatureToggle,
  IR,
  NameTransformer,
  NamingOptions,
  Plugin,
} from '@hey-api/shared';

export type UserConfig = Plugin.Name<'@tanstack/svelte-query'> &
  Plugin.Hooks &
  Plugin.UserComments &
  Plugin.UserExports & {
    /**
     * Casing convention for generated names.
     *
     * @default 'camelCase'
     */
    case?: Casing;
    /**
     * Configuration for generated infinite query key helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createinfinitequery}
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
           * @default '{{name}}InfiniteQueryKey'
           * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createinfinitequery
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
     * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createinfinitequery}
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
           * @default '{{name}}InfiniteOptions'
           * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createinfinitequery
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for generated mutation options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createmutation}
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
           * @default '{{name}}Mutation'
           * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createmutation
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for generated query keys.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/react/guides/query-keys}
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
           * @default '{{name}}QueryKey'
           * @see https://tanstack.com/query/v5/docs/framework/react/guides/query-keys
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
     * See {@link https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createquery}
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
           * @default '{{name}}Options'
           * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createquery
           */
          name?: NameTransformer;
        };
  };

export type Config = Plugin.Name<'@tanstack/svelte-query'> &
  Plugin.Hooks &
  Plugin.Comments &
  Plugin.Exports & {
    /**
     * Casing convention for generated names.
     */
    case: Casing;
    /**
     * Resolved configuration for generated infinite query key helpers.
     *
     * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createinfinitequery
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
     * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createinfinitequery
     */
    infiniteQueryOptions: NamingOptions &
      FeatureToggle & {
        /**
         * Custom function to generate metadata for the operation.
         * Can return any valid meta object that will be included in the generated infinite query options.
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
     * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createmutation
     */
    mutationOptions: NamingOptions &
      FeatureToggle & {
        /**
         * Custom function to generate metadata for the operation.
         * Can return any valid meta object that will be included in the generated mutation options.
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
     * @see https://tanstack.com/query/v5/docs/framework/react/guides/query-keys
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
     * @see https://tanstack.com/query/v5/docs/framework/svelte/reference/functions/createquery
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
  };

export type TanStackSvelteQueryPlugin = DefinePlugin<UserConfig, Config>;
