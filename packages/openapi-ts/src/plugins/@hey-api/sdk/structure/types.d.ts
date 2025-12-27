import type {
  OperationPathStrategy,
  OperationStructureStrategy,
} from '~/openApi/shared/locations';
import type { NamingConfig, NamingRule } from '~/utils/naming';

export type StructureStrategy =
  | 'byTags'
  | 'flat'
  | 'single'
  | OperationStructureStrategy;

export interface UserStructureConfig {
  /**
   * Type of container for grouped operations.
   *
   * Ignored when `strategy` is `'flat'`.
   *
   * - `'class'` - Class with methods
   * - `'object'` - Plain object literal
   *
   * @default 'class'
   */
  container?: 'class' | 'object';
  /**
   * Customize container names (class or object variable names).
   *
   * For `'single'` strategy, this sets the root container name.
   * For `'byTags'` strategy, this transforms tag names.
   *
   * @default 'Sdk' for `'single'` strategy
   *
   * @example
   * // Set root name for single strategy
   * containerName: 'MyApi'
   *
   * @example
   * // Transform tag names with suffix
   * containerName: '{{name}}Service'
   *
   * @example
   * // With casing
   * containerName: { name: '{{name}}Service', case: 'PascalCase' }
   */
  containerName?: NamingRule;
  /**
   * Customize method/function names.
   *
   * Applied to the final segment of the path (the method name).
   */
  methodName?: NamingRule;
  /**
   * How methods are attached to class containers.
   *
   * Only applies when `container` is `'class'`.
   *
   * - `'static'` - Static methods, no instantiation required
   * - `'instance'` - Instance methods, requires `new ClassName(config)`
   *
   * @default 'instance'
   */
  methods?: 'instance' | 'static';
  /**
   * How to derive nesting structure from operations.
   *
   * Ignored when `strategy` is `'flat'`.
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
   * Applied to intermediate path segments (not the method name).
   */
  segmentName?: NamingRule;
  /**
   * Grouping strategy.
   *
   * - `'flat'` - Standalone functions, no grouping
   * - `'byTags'` - One container per operation tag
   * - `'single'` - All operations in one container
   * - Custom function for full control
   *
   * @default 'flat'
   */
  strategy?: StructureStrategy;
  /**
   * Default container name for operations without tags.
   *
   * Only applies when `strategy` is `'byTags'`.
   *
   * @default 'default'
   */
  strategyDefaultTag?: string;
}

export interface StructureConfig {
  /**
   * Type of container for grouped operations.
   *
   * Ignored when `strategy` is `'flat'`.
   *
   * - `'class'` - Class with methods
   * - `'object'` - Plain object literal
   */
  container: 'class' | 'object';
  /**
   * Customize container names (class or object variable names).
   *
   * For `'single'` strategy, this sets the root container name.
   * For `'byTags'` strategy, this transforms tag names.
   *
   * @default 'Sdk' for `'single'` strategy
   *
   * @example
   * // Set root name for single strategy
   * containerName: 'MyApi'
   *
   * @example
   * // Transform tag names with suffix
   * containerName: '{{name}}Service'
   *
   * @example
   * // With casing
   * containerName: { name: '{{name}}Service', case: 'PascalCase' }
   */
  containerName: NamingConfig;
  /**
   * Customize method/function names.
   *
   * Applied to the final segment of the path (the method name).
   */
  methodName: NamingConfig;
  /**
   * How methods are attached to class containers.
   *
   * Only applies when `container` is `'class'`.
   *
   * - `'static'` - Static methods, no instantiation required
   * - `'instance'` - Instance methods, requires `new ClassName(config)`
   */
  methods: 'instance' | 'static';
  /**
   * How to derive nesting structure from operations.
   *
   * Ignored when `strategy` is `'flat'`.
   *
   * - `'operationId'` - Split operationId by delimiters (e.g., `users.list` → `Users.list()`)
   * - `'id'` - Use operation id as-is, no nesting
   * - Custom function for full control
   */
  nesting: 'operationId' | 'id' | OperationPathStrategy;
  /**
   * Delimiters for splitting operationId.
   *
   * Only applies when `nesting` is `'operationId'`.
   */
  nestingDelimiters: RegExp;
  /**
   * Customize nesting segment names.
   *
   * Applied to intermediate path segments (not the method name).
   */
  segmentName: NamingConfig;
  /**
   * Grouping strategy.
   *
   * - `'flat'` - Standalone functions, no grouping
   * - `'byTags'` - One container per operation tag
   * - `'single'` - All operations in one container
   * - Custom function for full control
   */
  strategy: StructureStrategy;
  /**
   * Default container name for operations without tags.
   *
   * Only applies when `strategy` is `'byTags'`.
   */
  strategyDefaultTag: string;
}
