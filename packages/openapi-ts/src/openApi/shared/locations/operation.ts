import type { StructureLocation } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';

/**
 * A function that derives path segments from an operation.
 *
 * Used by location strategies to build paths within containers.
 */
export type OperationPathStrategy = (
  operation: IR.OperationObject,
) => ReadonlyArray<string>;

/**
 * A function that determines where an operation appears in the structure.
 *
 * Returns one or more locations, each with a full path.
 */
export type OperationStructureStrategy = (
  operation: IR.OperationObject,
) => ReadonlyArray<StructureLocation['path']>;

export type OperationsStrategy =
  | 'byTags'
  | 'flat'
  | 'single'
  | OperationStructureStrategy;

/**
 * Built-in strategies for operations.
 */
export const OperationStrategies = {
  /**
   * Creates one root container per operation tag.
   *
   * Operations with multiple tags appear in multiple root containers.
   * Operations without tags use the fallback root container.
   *
   * @example
   * // Operation with tags: ['users', 'admin']
   * // Path function returns: ['list']
   * // Result: [{ path: ['users', 'list'], shell }, { path: ['admin', 'list'], shell }]
   */
  byTags:
    (config: {
      /**
       * Root name for operations without tags.
       */
      fallback: string;
      /**
       * Derives path segments from the operation.
       */
      path: OperationPathStrategy;
    }): OperationStructureStrategy =>
    (operation) => {
      const tags =
        operation.tags && operation.tags.length > 0
          ? operation.tags
          : [config.fallback];
      const pathSegments = config.path(operation);
      return tags.map((tag) => [tag, ...pathSegments]);
    },

  /**
   * Creates flat functions without any container.
   *
   * Each operation becomes a standalone function at the root level.
   * No shell is applied.
   *
   * @example
   * // Operation id: 'getUsers'
   * // Result: [{ path: ['getUsers'] }]
   */
  flat:
    (config: {
      /**
       * Derives path segments within the root from the operation.
       */
      path: OperationPathStrategy;
    }): OperationStructureStrategy =>
    (operation) => {
      const pathSegments = config.path(operation);
      return [[pathSegments[pathSegments.length - 1]!]];
    },

  /**
   * Places all operations under a single root container.
   *
   * @example
   * // Root: 'Sdk', path function returns: ['users', 'list']
   * // Result: [{ path: ['Sdk', 'users', 'list'], shell }]
   */
  single:
    (config: {
      /**
       * Derives path segments within the root from the operation.
       */
      path: OperationPathStrategy;
      /**
       * Name of the container.
       */
      root: string;
    }): OperationStructureStrategy =>
    (operation) => {
      const pathSegments = config.path(operation);
      return [[config.root, ...pathSegments]];
    },
};

/**
 * Built-in path derivation helpers for operations.
 */
export const OperationPath = {
  /**
   * Splits operationId by delimiters to create nested paths.
   *
   * The last segment is converted to camelCase.
   * Falls back to operation.id if operationId is missing.
   *
   * @example
   * // operationId: 'users.accounts.list'
   * // Result: ['users', 'accounts', 'list']
   *
   * @example
   * // operationId: 'users/accounts/getAll'
   * // Result: ['users', 'accounts', 'getAll']
   */
  fromOperationId:
    (config: {
      /**
       * Pattern to split operationId.
       */
      delimiters: RegExp;
    }): OperationPathStrategy =>
    (operation) => {
      if (!operation.operationId) return [operation.id];
      const segments = operation.operationId
        .split(config.delimiters)
        .filter(Boolean);
      return segments.length > 0 ? segments : [operation.id];
    },

  /**
   * Uses operation.id as a single path segment.
   *
   * @example
   * // operation.id: 'getUserById'
   * // Result: ['getUserById']
   */
  id: (): OperationPathStrategy => (operation) => [operation.id],
};
