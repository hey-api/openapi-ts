import type { IR } from '../../../ir/types';
// import type { StringCase, StringName } from '../../../types/case';
import type { DefinePlugin, Plugin } from '../../types';

export type UserConfig = Plugin.Name<'@pinia/colada'> & {
  /**
   * Default cache time for queries in milliseconds.
   *
   * @default undefined
   */
  defaultCacheTime?: number;
  /**
   * Default stale time for queries in milliseconds.
   *
   * @default undefined
   */
  defaultStaleTime?: number;
  /**
   * Enable pagination support on this key when found in the query parameters or body.
   *
   * @default undefined
   */
  enablePaginationOnKey?: string;
  /**
   * How to handle error responses.
   * 'unified' - Unified error type for all errors
   * 'specific' - Specific error types per operation
   *
   * @default 'specific'
   */
  errorHandling?: 'unified' | 'specific';
  /**
   * Should the exports from the generated files be re-exported in the index barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Group operations by tag into separate files.
   *
   * @default false
   */
  groupByTag?: boolean;
  /**
   * Import path for the plugin.
   *
   * @default '@pinia/colada'
   */
  importPath?: string;
  /**
   * Include types in the generated files.
   *
   * @default true
   */
  includeTypes?: boolean;
  /**
   * Custom hook to customize or skip mutation generation.
   * Return false to skip generating a mutation for this operation.
   *
   * @default undefined
   */
  onMutation?: (operation: IR.OperationObject) => boolean | undefined;
  /**
   * Custom hook to customize or skip query generation.
   * Return false to skip generating a query for this operation.
   *
   * @default undefined
   */
  onQuery?: (operation: IR.OperationObject) => boolean | undefined;
  /**
   * Plugin output path.
   *
   * @default '@pinia/colada'
   */
  output: string;
  /**
   * Whether to prefix generated function names with 'use'.
   *
   * @default true
   */
  prefixUse?: boolean;
  /**
   * Custom hook that determines if an operation should be a query or not.
   * Return true to force query, false to force mutation, undefined to use default logic.
   *
   * @default undefined
   */
  resolveQuery?: (operation: IR.OperationObject) => boolean | undefined;
  /**
   * Custom hook to resolve query key.
   * Default is [operation.tags?.[0] || 'default', operation.id]
   *
   * @default undefined
   */
  resolveQueryKey?: (operation: IR.OperationObject) => Array<string>;
  /**
   * Whether to suffix generated function names with 'Query' or 'Mutation' to indicate the type
   * of Pinia Colada operation that is used under the hood.
   *
   * @default true
   */
  suffixQueryMutation?: boolean;
  /**
   * Use infinite queries.
   *
   * @default false
   */
  useInfiniteQueries?: boolean;
};

export type Config = Plugin.Name<'@pinia/colada'> & {
  /**
   * Default cache time for queries in milliseconds.
   *
   * @default undefined
   */
  defaultCacheTime: number | undefined;
  /**
   * Default stale time for queries in milliseconds.
   *
   * @default undefined
   */
  defaultStaleTime: number | undefined;
  /**
   * Enable pagination support on this key when found in the query parameters or body.
   *
   * @default undefined
   */
  enablePaginationOnKey?: string;
  /**
   * How to handle error responses.
   * 'unified' - Unified error type for all errors
   * 'specific' - Specific error types per operation
   *
   * @default 'specific'
   */
  errorHandling?: 'unified' | 'specific';
  /**
   * Should the exports from the generated files be re-exported in the index barrel file?
   *
   * @default false
   */
  exportFromIndex: boolean;
  /**
   * Group operations by tag into separate files.
   *
   * @default false
   */
  groupByTag?: boolean;
  /**
   * Import path for the plugin.
   *
   * @default '@pinia/colada'
   */
  importPath?: string;
  /**
   * Include types in the generated files.
   *
   * @default true
   */
  includeTypes?: boolean;
  /**
   * Custom hook to customize or skip mutation generation.
   * Return false to skip generating a mutation for this operation.
   *
   * @default undefined
   */
  onMutation?: (operation: IR.OperationObject) => boolean | undefined;
  /**
   * Custom hook to customize or skip query generation.
   * Return false to skip generating a query for this operation.
   *
   * @default undefined
   */
  onQuery?: (operation: IR.OperationObject) => boolean | undefined;
  /**
   * Plugin output path.
   *
   * @default '@pinia/colada'
   */
  output: string;
  /**
   * Whether to prefix generated function names with 'use'.
   *
   * @default true
   */
  prefixUse?: boolean;
  /**
   * Custom hook that determines if an operation should be a query or not.
   * Return true to force query, false to force mutation, undefined to use default logic.
   *
   * @default undefined
   */
  resolveQuery?: (operation: IR.OperationObject) => boolean | undefined;
  /**
   * Custom hook to resolve query key.
   * Default is [operation.tags?.[0] || 'default', operation.id]
   *
   * @default undefined
   */
  resolveQueryKey?: (operation: IR.OperationObject) => Array<string>;
  /**
   * Whether to suffix generated function names with 'Query' or 'Mutation' to indicate the type
   * of Pinia Colada operation that is used under the hood.
   *
   * @default true
   */
  suffixQueryMutation?: boolean;
  /**
   * Use infinite queries.
   *
   * @default false
   */
  useInfiniteQueries?: boolean;
};

export type PiniaColadaPlugin = DefinePlugin<UserConfig, Config>;
