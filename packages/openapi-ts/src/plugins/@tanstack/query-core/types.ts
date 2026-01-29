import type { TanStackAngularQueryPlugin } from '../../../plugins/@tanstack/angular-query-experimental/types';
import type { TanStackReactQueryPlugin } from '../../../plugins/@tanstack/react-query/types';
import type { TanStackSolidQueryPlugin } from '../../../plugins/@tanstack/solid-query/types';
import type { TanStackSvelteQueryPlugin } from '../../../plugins/@tanstack/svelte-query/types';
import type { TanStackVueQueryPlugin } from '../../../plugins/@tanstack/vue-query/types';

export interface PluginHandler {
  (...args: Parameters<TanStackAngularQueryPlugin['Handler']>): void;
  (...args: Parameters<TanStackReactQueryPlugin['Handler']>): void;
  (...args: Parameters<TanStackSolidQueryPlugin['Handler']>): void;
  (...args: Parameters<TanStackSvelteQueryPlugin['Handler']>): void;
  (...args: Parameters<TanStackVueQueryPlugin['Handler']>): void;
}

export type PluginInstance =
  | TanStackAngularQueryPlugin['Instance']
  | TanStackReactQueryPlugin['Instance']
  | TanStackSolidQueryPlugin['Instance']
  | TanStackSvelteQueryPlugin['Instance']
  | TanStackVueQueryPlugin['Instance'];
