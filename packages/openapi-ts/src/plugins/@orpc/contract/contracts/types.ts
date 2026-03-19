import type {
  NamingConfig,
  NamingRule,
  OperationPathStrategy,
  OperationsStrategy,
} from '@hey-api/shared';

export interface UserContractsConfig {
  /**
   * Type of container for grouped contracts.
   *
   * Ignored when `strategy` is `'flat'`.
   *
   * - `'object'` - Object with properties
   *
   * @default 'object'
   */
  container?: 'object';
  /**
   * Customize container names.
   *
   * For `'single'` strategy, this sets the root container name.
   * For `'byTags'` strategy, this transforms tag names.
   *
   * @default 'contract' for `'single'` strategy
   *
   * @example
   * // Set root name for single strategy
   * containerName: 'myContract'
   *
   * @example
   * // Transform tag names with suffix
   * containerName: '{{name}}Contract'
   *
   * @example
   * // With casing
   * containerName: { name: '{{name}}Contract', casing: 'camelCase' }
   */
  containerName?: NamingRule;
  /**
   * Customize contract names.
   *
   * Applied to the final segment of the path (the contract name).
   */
  contractName?: NamingRule;
  /**
   * How to derive nesting structure from operations.
   *
   * - `'operationId'` - Split operationId by delimiters (e.g., `users.list` → `Users.list()`)
   * - `'id'` - Use operation id as-is, no nesting
   * - Custom function for full control
   *
   * @default 'operationId'
   */
  nesting?: 'operationId' | 'id' | OperationPathStrategy;
  /**
   * Delimiters for splitting operationId.
   *
   * Only applies when `nesting` is `'operationId'`.
   *
   * @default /[./]/
   */
  nestingDelimiters?: RegExp;
  /**
   * Customize nesting segment names.
   *
   * Applied to intermediate path segments (not the contract name).
   */
  segmentName?: NamingRule;
  /**
   * Grouping strategy.
   *
   * - `'flat'` - Standalone contracts, no grouping
   * - `'byTags'` - One container per operation tag
   * - `'single'` - All contracts in one container
   * - Custom function for full control
   *
   * @default 'flat'
   */
  strategy?: OperationsStrategy;
  /**
   * Default container name for operations without tags.
   *
   * Only applies when `strategy` is `'byTags'`.
   *
   * @default 'default'
   */
  strategyDefaultTag?: string;
}

export interface ContractsConfig {
  /** Type of container for grouped operations. */
  container: 'object';
  /** Customize container names. */
  containerName: NamingConfig;
  /** Customize contract names. */
  contractName: NamingConfig;
  /** How to derive nesting structure from operations. */
  nesting: 'operationId' | 'id' | OperationPathStrategy;
  /** Delimiters for splitting operationId. */
  nestingDelimiters: RegExp;
  /** Customize nesting segment names. */
  segmentName: NamingConfig;
  /** Grouping strategy. */
  strategy: OperationsStrategy;
  /** Default container name for operations without tags. */
  strategyDefaultTag: string;
}
