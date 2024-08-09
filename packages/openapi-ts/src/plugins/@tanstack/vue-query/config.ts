import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackVueQuery =
  PluginTanStackQueryConfig<'@tanstack/vue-query'>;

export const pluginTanStackVueQueryDefaultConfig: Required<PluginTanStackVueQuery> =
  tanstackQueryDefaultConfig('@tanstack/vue-query');
