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
