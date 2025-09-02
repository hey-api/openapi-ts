import type { IR } from '../../../ir/types';
import type { StringCase, StringName } from '../../../types/case';
import type { DefinePlugin, Plugin } from '../../types';

export type UserConfig = Plugin.Name<'@tanstack/vue-query'> &
  Plugin.Hooks & {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case?: StringCase;
    /**
     * Add comments from SDK functions to the generated TanStack Query code?
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
     * Should the exports from the generated files be re-exported in the index barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Configuration for generated infinite query key helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions}
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
      | StringName
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
           * @see https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions
           */
          name?: StringName;
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
     * See {@link https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions}
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
      | StringName
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
           * Custom function to generate metadata for the operation.
           * Can return any valid meta object that will be included in the generated infinite query options.
           *
           * @param operation - The operation object containing all available metadata
           * @returns A meta object with any properties you want to include
           *
           * @example
           * ```typescript
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
           * @default '{{name}}InfiniteOptions'
           * @see https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions
           */
          name?: StringName;
        };
    /**
     * Configuration for generated mutation options helpers.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/vue/reference/useMutation}
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
      | StringName
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
           * Custom function to generate metadata for the operation.
           * Can return any valid meta object that will be included in the generated mutation options.
           *
           * @param operation - The operation object containing all available metadata
           * @returns A meta object with any properties you want to include
           *
           * @example
           * ```typescript
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
           * @default '{{name}}Mutation'
           * @see https://tanstack.com/query/v5/docs/framework/vue/reference/useMutation
           */
          name?: StringName;
        };
    /**
     * Name of the generated file.
     *
     * @default '@tanstack/vue-query'
     */
    output?: string;
    /**
     * Configuration for generated query keys.
     *
     * See {@link https://tanstack.com/query/v5/docs/framework/vue/reference/queryKey}
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
      | StringName
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
           * @see https://tanstack.com/query/v5/docs/framework/vue/reference/queryKey
           */
          name?: StringName;
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
     * See {@link https://tanstack.com/query/v5/docs/framework/vue/reference/queryOptions}
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
      | StringName
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
           * ```typescript
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
           * @default '{{name}}Options'
           * @see https://tanstack.com/query/v5/docs/framework/vue/reference/queryOptions
           */
          name?: StringName;
        };
  };

export type Config = Plugin.Name<'@tanstack/vue-query'> &
  Plugin.Hooks & {
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
     * @see https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions
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
       * Custom naming pattern for generated infinite query key names. The name variable is
       * obtained from the SDK function name.
       *
       * @default '{{name}}InfiniteQueryKey'
       * @see https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions
       */
      name: StringName;
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
     * @see https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions
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
       * Custom function to generate metadata for the operation.
       * Can return any valid meta object that will be included in the generated infinite query options.
       *
       * @param operation - The operation object containing all available metadata
       * @returns A meta object with any properties you want to include
       *
       * @example
       * ```typescript
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
       * Custom naming pattern for generated infinite query options names. The name variable is
       * obtained from the SDK function name.
       *
       * @default '{{name}}InfiniteOptions'
       * @see https://tanstack.com/query/v5/docs/framework/vue/reference/infiniteQueryOptions
       */
      name: StringName;
    };
    /**
     * Resolved configuration for generated mutation options helpers.
     *
     * @see https://tanstack.com/query/v5/docs/framework/vue/reference/useMutation
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
       * Custom function to generate metadata for the operation.
       * Can return any valid meta object that will be included in the generated mutation options.
       *
       * @param operation - The operation object containing all available metadata
       * @returns A meta object with any properties you want to include
       *
       * @example
       * ```typescript
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
       * Custom naming pattern for generated mutation options names. The name variable is
       * obtained from the SDK function name.
       *
       * @default '{{name}}Mutation'
       * @see https://tanstack.com/query/v5/docs/framework/vue/reference/useMutation
       */
      name: StringName;
    };
    /**
     * Name of the generated file.
     *
     * @default '@tanstack/vue-query'
     */
    output: string;
    /**
     * Resolved configuration for generated query keys.
     *
     * @see https://tanstack.com/query/v5/docs/framework/vue/reference/queryKey
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
       * Custom naming pattern for generated query key names. The name variable is
       * obtained from the SDK function name.
       *
       * @default '{{name}}QueryKey'
       * @see https://tanstack.com/query/v5/docs/framework/vue/reference/queryKey
       */
      name: StringName;
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
     * @see https://tanstack.com/query/v5/docs/framework/vue/reference/queryOptions
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
       * ```typescript
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
       * Custom naming pattern for generated query options names. The name variable is
       * obtained from the SDK function name.
       *
       * @default '{{name}}Options'
       * @see https://tanstack.com/query/v5/docs/framework/vue/reference/queryOptions
       */
      name: StringName;
    };
  };

export type TanStackVueQueryPlugin = DefinePlugin<UserConfig, Config>;
