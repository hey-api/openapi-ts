import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin } from '~/plugins';

export type UserConfig = Plugin.Name<'@orpc/contract'> &
  Plugin.Hooks & {
    /**
     * Custom naming function for contract symbols.
     *
     * @default (id) => `${id}Contract`
     */
    contractNameBuilder?: (operationId: string) => string;
    /**
     * Default tag name for operations without tags.
     *
     * @default 'default'
     */
    defaultTag?: string;
    /**
     * Whether exports should be re-exported in the index file.
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Custom function to extract group key for router grouping.
     * Receives the full IR.OperationObject.
     *
     * @default extracts first path segment as camelCase
     */
    groupKeyBuilder?: (operation: IR.OperationObject) => string;
    /**
     * Custom function to generate operation key within a group.
     *
     * @default (operationId, groupKey) => simplified operationId
     */
    operationKeyBuilder?: (operationId: string, groupKey: string) => string;
    /**
     * Name of the router export.
     * The type export will be the capitalized version (e.g., 'router' → 'Router').
     *
     * @default 'router'
     */
    routerName?: string;
  };

export type Config = Plugin.Name<'@orpc/contract'> &
  Plugin.Hooks & {
    contractNameBuilder: (operationId: string) => string;
    defaultTag: string;
    exportFromIndex: boolean;
    groupKeyBuilder: (operation: IR.OperationObject) => string;
    operationKeyBuilder: (operationId: string, groupKey: string) => string;
    output: string;
    routerName: string;
  };

export type OrpcPlugin = DefinePlugin<UserConfig, Config>;
