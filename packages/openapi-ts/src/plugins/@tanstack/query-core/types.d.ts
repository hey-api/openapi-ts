import type { ImportExportItem } from '../../../compiler/module';
import type { Plugin } from '../../types';
import type { TanStackAngularQueryPlugin } from '../angular-query-experimental/types';
import type { TanStackReactQueryPlugin } from '../react-query/types';
import type { TanStackSolidQueryPlugin } from '../solid-query/types';
import type { TanStackSvelteQueryPlugin } from '../svelte-query/types';
import type { TanStackVueQueryPlugin } from '../vue-query/types';

export type PluginHandler = Plugin.Handler<
  | TanStackAngularQueryPlugin
  | TanStackReactQueryPlugin
  | TanStackSolidQueryPlugin
  | TanStackSvelteQueryPlugin
  | TanStackVueQueryPlugin
>;

export type PluginInstance = Plugin.Instance<
  | TanStackAngularQueryPlugin
  | TanStackReactQueryPlugin
  | TanStackSolidQueryPlugin
  | TanStackSvelteQueryPlugin
  | TanStackVueQueryPlugin
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
