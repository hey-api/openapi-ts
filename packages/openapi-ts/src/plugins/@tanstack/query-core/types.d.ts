import type { ImportExportItem } from '../../../compiler/module';
import type { Plugin } from '../../types';
import type { ResolvedConfig as AngularQueryResolvedConfig } from '../angular-query-experimental/types';
import type { ResolvedConfig as ReactQueryResolvedConfig } from '../react-query/types';
import type { ResolvedConfig as SolidQueryResolvedConfig } from '../solid-query/types';
import type { ResolvedConfig as SvelteQueryResolvedConfig } from '../svelte-query/types';
import type { ResolvedConfig as VueQueryResolvedConfig } from '../vue-query/types';

export type PluginHandler = Plugin.Handler<
  | AngularQueryResolvedConfig
  | ReactQueryResolvedConfig
  | SolidQueryResolvedConfig
  | SvelteQueryResolvedConfig
  | VueQueryResolvedConfig
>;

export type PluginInstance = Plugin.Instance<
  | AngularQueryResolvedConfig
  | ReactQueryResolvedConfig
  | SolidQueryResolvedConfig
  | SvelteQueryResolvedConfig
  | VueQueryResolvedConfig
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
