import type {
  OperationPathStrategy,
  OperationsStrategy,
} from '~/openApi/shared/locations';
import type { DefinePlugin, Plugin } from '~/plugins';
import type { PluginValidatorNames } from '~/plugins/types';
import type { NamingConfig, NamingRule } from '~/utils/naming';

export interface UserRouterConfig {
  /**
   * Customize key names for operations in the router.
   *
   * Applied to the final segment of the path (the key name).
   */
  keyName?: NamingRule;
  /**
   * How to derive nesting structure from operations.
   *
   * - `'operationId'` - Split operationId by delimiters (e.g., `users.list` → `{ users: { list } }`)
   * - `'id'` - Use operation id as-is, no nesting
   * - Custom function for full control
   *
   * @default 'operationId'
   */
  nesting?: 'id' | 'operationId' | OperationPathStrategy;
  /**
   * Delimiters for splitting operationId.
   *
   * Only applies when `nesting` is `'operationId'`.
   *
   * @default /[./]/
   */
  nestingDelimiters?: RegExp;
  /**
   * Customize segment names for nested groups.
   *
   * Applied to intermediate path segments (not the key name).
   */
  segmentName?: NamingRule;
  /**
   * Grouping strategy.
   *
   * - `'flat'` - No grouping, all contracts at root level
   * - `'byTags'` - One group per operation tag
   * - `'single'` - All operations in one group
   * - Custom function for full control
   *
   * @default 'flat'
   */
  strategy?: OperationsStrategy;
  /**
   * Default group name for operations without tags.
   *
   * Only applies when `strategy` is `'byTags'`.
   *
   * @default 'default'
   */
  strategyDefaultTag?: string;
}

export interface RouterConfig {
  /**
   * Customize key names for operations in the router.
   *
   * Applied to the final segment of the path (the key name).
   */
  keyName: NamingConfig;
  /**
   * How to derive nesting structure from operations.
   *
   * - `'operationId'` - Split operationId by delimiters (e.g., `users.list` → `{ users: { list } }`)
   * - `'id'` - Use operation id as-is, no nesting
   * - Custom function for full control
   */
  nesting: 'id' | 'operationId' | OperationPathStrategy;
  /**
   * Delimiters for splitting operationId.
   *
   * Only applies when `nesting` is `'operationId'`.
   */
  nestingDelimiters: RegExp;
  /**
   * Customize segment names for nested groups.
   *
   * Applied to intermediate path segments (not the key name).
   */
  segmentName: NamingConfig;
  /**
   * Grouping strategy.
   *
   * - `'flat'` - No grouping, all contracts at root level
   * - `'byTags'` - One group per operation tag
   * - `'single'` - All operations in one group
   * - Custom function for full control
   */
  strategy: OperationsStrategy;
  /**
   * Default group name for operations without tags.
   *
   * Only applies when `strategy` is `'byTags'`.
   */
  strategyDefaultTag: string;
}

export type UserConfig = Plugin.Name<'@orpc/contract'> &
  Plugin.Hooks & {
    /**
     * Custom naming function for contract symbols.
     *
     * @default (id) => `${id}Contract`
     */
    contractNameBuilder?: (operationId: string) => string;
    /**
     * Whether exports should be re-exported in the index file.
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Router configuration for grouping and nesting operations.
     *
     * Can be a strategy string for simple cases, or an object for full control.
     *
     * @default { strategy: 'flat' }
     *
     * @example
     * // Simple: just set strategy
     * router: 'byTags'
     *
     * @example
     * // Full control
     * router: {
     *   strategy: 'byTags',
     *   nesting: 'operationId',
     *   segmentName: { casing: 'camelCase' },
     *   keyName: { casing: 'camelCase' },
     * }
     */
    router?: OperationsStrategy | UserRouterConfig;
    /**
     * Naming rule for the router export.
     * The type export will be the PascalCase version (e.g., 'router' → 'Router').
     *
     * @default 'router'
     *
     * @example
     * // Simple string
     * routerName: 'contract'
     *
     * @example
     * // Template string
     * routerName: '{{name}}Contract'
     *
     * @example
     * // With casing
     * routerName: { name: '{{name}}Contract', casing: 'camelCase' }
     */
    routerName?: NamingRule;
    /**
     * Validator plugin to use for input/output schemas.
     *
     * Ensure you have declared the selected library as a dependency to avoid
     * errors.
     *
     * @default 'zod'
     */
    validator?: PluginValidatorNames;
  };

export type Config = Plugin.Name<'@orpc/contract'> &
  Plugin.Hooks & {
    contractNameBuilder: (operationId: string) => string;
    exportFromIndex: boolean;
    output: string;
    router: RouterConfig;
    routerName: NamingConfig;
    validator: PluginValidatorNames;
  };

export type OrpcContractPlugin = DefinePlugin<UserConfig, Config>;
