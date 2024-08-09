import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackSolidQuery =
  PluginTanStackQueryConfig<'@tanstack/solid-query'>;

export const pluginTanStackSolidQueryDefaultConfig: Required<PluginTanStackSolidQuery> =
  tanstackQueryDefaultConfig('@tanstack/solid-query');
