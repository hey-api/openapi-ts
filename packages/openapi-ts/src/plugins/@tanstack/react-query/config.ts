import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackReactQuery =
  PluginTanStackQueryConfig<'@tanstack/react-query'>;

export const pluginTanStackReactQueryDefaultConfig: Required<PluginTanStackReactQuery> =
  tanstackQueryDefaultConfig('@tanstack/react-query');
