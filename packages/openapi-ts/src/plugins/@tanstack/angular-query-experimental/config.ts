import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackAngularQueryExperimental =
  PluginTanStackQueryConfig<'@tanstack/angular-query-experimental'>;

export const pluginTanStackAngularQueryExperimentalDefaultConfig: Required<PluginTanStackAngularQueryExperimental> =
  tanstackQueryDefaultConfig('@tanstack/angular-query-experimental');
