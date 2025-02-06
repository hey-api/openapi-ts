import type { IR } from '../../../ir/types';
import type { Plugin } from '../../types';

export interface QueryHooks {
  /**
   * Customize the query key for a specific operation
   */
  getQueryKey?: (operation: IR.OperationObject) => string[];

  /**
   * Override the default query detection logic for an operation.
   * Return true to force treat as query, false to force treat as mutation.
   * Return undefined to use default detection logic.
   */
  isQuery?: (operation: IR.OperationObject) => boolean | undefined;

  /**
   * Called when a mutation is created. Return false to skip generating this mutation.
   */
  onMutation?: (operation: IR.OperationObject) => boolean | void;

  /**
   * Called when a query is created. Return false to skip generating this query.
   */
  onQuery?: (operation: IR.OperationObject) => boolean | void;
}

export interface Config extends Plugin.Name<'@pinia-colada/sdk'> {
  /**
   * Export queries/mutations from index?
   * @default true
   */
  exportFromIndex?: boolean;

  /**
   * Group queries by tag into separate files?
   * @default false
   */
  groupByTag?: boolean;

  /**
   * Hooks to customize query/mutation generation
   */
  hooks?: QueryHooks;

  /**
   * Name of the generated file.
   * @default 'queries'
   */
  output?: string;
}
