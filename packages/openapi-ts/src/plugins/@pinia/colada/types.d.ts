import type { IR } from '../../../ir/types';
import type { StringCase, StringName } from '../../../types/case';
import type { DefinePlugin, Plugin } from '../../types';

export type UserConfig = Plugin.Name<'@pinia/colada'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case?: StringCase;
  /**
   * Add comments from SDK functions to the generated Pinia Colada code?
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
   * Configuration for generated mutation options helpers.
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
         */
        meta?: false | ((operation: IR.OperationObject) => Record<string, any>);
        /**
         * Custom naming pattern for generated mutation options names. The name variable is
         * obtained from the SDK function name.
         *
         * @default '{{name}}Mutation'
         */
        name?: StringName;
      };
  /**
   * Name of the generated file.
   *
   * @default '@pinia/colada'
   */
  output?: string;
  /**
   * Configuration for generated query options helpers.
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
         */
        meta?: false | ((operation: IR.OperationObject) => Record<string, any>);
        /**
         * Custom naming pattern for generated query options names. The name variable is
         * obtained from the SDK function name.
         *
         * @default '{{name}}Query'
         */
        name?: StringName;
      };
};

export type Config = Plugin.Name<'@pinia/colada'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case: StringCase;
  /**
   * Add comments from SDK functions to the generated Pinia Colada code?
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
   * Resolved configuration for generated mutation options helpers.
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
     */
    meta?: false | ((operation: IR.OperationObject) => Record<string, any>);
    /**
     * Custom naming pattern for generated mutation options names. The name variable is
     * obtained from the SDK function name.
     *
     * @default '{{name}}Mutation'
     */
    name: StringName;
  };
  /**
   * Name of the generated file.
   *
   * @default '@pinia/colada'
   */
  output: string;
  /**
   * Resolved configuration for generated query options helpers.
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
     */
    meta?: false | ((operation: IR.OperationObject) => Record<string, any>);
    /**
     * Custom naming pattern for generated query options names. The name variable is
     * obtained from the SDK function name.
     *
     * @default '{{name}}Query'
     */
    name: StringName;
  };
};

export type PiniaColadaPlugin = DefinePlugin<UserConfig, Config>;
