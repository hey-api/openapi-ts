import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackSvelteQuery =
  PluginTanStackQueryConfig<'@tanstack/svelte-query'>;

export const pluginTanStackSvelteQueryDefaultConfig: Required<PluginTanStackSvelteQuery> =
  tanstackQueryDefaultConfig('@tanstack/svelte-query');
