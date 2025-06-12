import type { ImportExportItem } from '../../../compiler/module';
import type { Plugin } from '../../types';
import type { Config as AngularQueryConfig } from '../angular-query-experimental';
import type { Config as ReactQueryConfig } from '../react-query';
import type { Config as SolidQueryConfig } from '../solid-query';
import type { Config as SvelteQueryConfig } from '../svelte-query';
import type { Config as VueQueryConfig } from '../vue-query';

export type PluginHandler = Plugin.Handler<
  | ReactQueryConfig
  | AngularQueryConfig
  | SolidQueryConfig
  | SvelteQueryConfig
  | VueQueryConfig
>;

export type PluginInstance = Plugin.Instance<
  | AngularQueryConfig
  | ReactQueryConfig
  | SolidQueryConfig
  | SvelteQueryConfig
  | VueQueryConfig
>;

export interface PluginState {
  hasCreateInfiniteParamsFunction: boolean;
  hasCreateQueryKeyParamsFunction: boolean;
  hasInfiniteQueries: boolean;
  hasMutations: boolean;
  hasQueries: boolean;
  hasUsedQueryFn: boolean;
  typeInfiniteData: ImportExportItem;
}

/**
 * Public TanStack Query API.
 */
export namespace TanStackQuery {
  export type Config = {
    /**
     * Add comments from SDK functions to the generated TanStack Query code?
     * Duplicating comments this way is useful so you don't need to drill into
     * the underlying SDK function to learn what it does or whether it's
     * deprecated. You can set this option to `false` if you prefer less
     * comment duplication.
     *
     * @default true
     */
    comments?: boolean;
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Customize the generated infinite query key names. The name variable is
     * obtained from the SDK function name.
     *
     * @default '{{name}}InfiniteQueryKey'
     */
    infiniteQueryKeyNameBuilder?: string | ((name: string) => string);
    /**
     * Customize the generated infinite query options names. The name variable
     * is obtained from the SDK function name.
     *
     * @default '{{name}}InfiniteOptions'
     */
    infiniteQueryOptionsNameBuilder?: string | ((name: string) => string);
    /**
     * Customize the generated mutation options names. The name variable is
     * obtained from the SDK function name.
     *
     * @default '{{name}}Mutation'
     */
    mutationOptionsNameBuilder?: string | ((name: string) => string);
    /**
     * Customize the generated query key names. The name variable is obtained
     * from the SDK function name.
     *
     * @default '{{name}}QueryKey'
     */
    queryKeyNameBuilder?: string | ((name: string) => string);
    /**
     * Customize the generated query options names. The name variable is
     * obtained from the SDK function name.
     *
     * @default '{{name}}Options'
     */
    queryOptionsNameBuilder?: string | ((name: string) => string);
  };
}
