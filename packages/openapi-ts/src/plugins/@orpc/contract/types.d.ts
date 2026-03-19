import type {
  // Casing,
  DefinePlugin,
  // FeatureToggle,
  // IR,
  // NameTransformer,
  // NamingOptions,
  NamingConfig,
  NamingRule,
  OperationPathStrategy,
  OperationsStrategy,
  Plugin,
} from '@hey-api/shared';

import type { PluginValidatorNames } from '../../types';

export interface UserRouterConfig {
  /**
   * Customize method/key names for operations in the router.
   *
   * Applied to the final segment of the path.
   */
  methodName?: NamingRule;
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
   * Customize method/key names for operations in the router.
   *
   * Applied to the final segment of the path.
   */
  methodName: NamingConfig;
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
  Plugin.Hooks &
  Plugin.UserExports & {
    /**
     * Custom naming function for contract symbols.
     *
     * @default (id) => `${id}Contract`
     */
    contractNameBuilder?: (operationId: string) => string;
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
     *   methodName: { casing: 'camelCase' },
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
     * Validate input/output schemas.
     *
     * @default true
     */
    validator?:
      | PluginValidatorNames
      | boolean
      | {
          /**
           * The validator plugin to use for input schemas.
           *
           * Can be a validator plugin name or boolean (true to auto-select, false
           * to disable).
           *
           * @default true
           */
          input?: PluginValidatorNames | boolean;
          /**
           * The validator plugin to use for output schemas.
           *
           * Can be a validator plugin name or boolean (true to auto-select, false
           * to disable).
           *
           * @default true
           */
          output?: PluginValidatorNames | boolean;
        };
  };

export type Config = Plugin.Name<'@orpc/contract'> &
  Plugin.Hooks &
  Plugin.Exports & {
    contractNameBuilder: (operationId: string) => string;
    router: RouterConfig;
    routerName: NamingConfig;
    /** Validate input/output schemas. */
    validator: {
      /** The validator plugin to use for input schemas. */
      input: PluginValidatorNames | false;
      /** The validator plugin to use for output schemas. */
      output: PluginValidatorNames | false;
    };
  };

export type OrpcContractPlugin = DefinePlugin<UserConfig, Config>;
