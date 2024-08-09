import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackSvelteQuery = Omit<
  PluginTanStackQueryConfig<'@tanstack/svelte-query'>,
  // UseMutationOptions is not exposed from '@tanstack/svelte-query'
  'mutationOptions'
>;

export const pluginTanStackSvelteQueryDefaultConfig: Required<PluginTanStackSvelteQuery> =
  tanstackQueryDefaultConfig('@tanstack/svelte-query');
