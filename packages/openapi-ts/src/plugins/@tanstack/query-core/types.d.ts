import type { ImportExportItem } from '../../../tsc/module';
import type { TanStackAngularQueryPlugin } from '../angular-query-experimental/types';
import type { TanStackReactQueryPlugin } from '../react-query/types';
import type { TanStackSolidQueryPlugin } from '../solid-query/types';
import type { TanStackSvelteQueryPlugin } from '../svelte-query/types';
import type { TanStackVueQueryPlugin } from '../vue-query/types';

export type PluginHandler =
  | TanStackAngularQueryPlugin['Handler']
  | TanStackReactQueryPlugin['Handler']
  | TanStackSolidQueryPlugin['Handler']
  | TanStackSvelteQueryPlugin['Handler']
  | TanStackVueQueryPlugin['Handler'];

export type PluginInstance =
  | TanStackAngularQueryPlugin['Instance']
  | TanStackReactQueryPlugin['Instance']
  | TanStackSolidQueryPlugin['Instance']
  | TanStackSvelteQueryPlugin['Instance']
  | TanStackVueQueryPlugin['Instance'];

export interface PluginState {
  hasCreateInfiniteParamsFunction: boolean;
  hasCreateQueryKeyParamsFunction: boolean;
  hasInfiniteQueries: boolean;
  hasMutations: boolean;
  hasQueries: boolean;
  hasUseQuery?: boolean;
  hasUsedQueryFn: boolean;
  typeInfiniteData: ImportExportItem;
}
