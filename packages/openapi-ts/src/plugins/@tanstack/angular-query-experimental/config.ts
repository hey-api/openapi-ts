import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackAngularQueryExperimental = Omit<
  PluginTanStackQueryConfig<'@tanstack/angular-query-experimental'>,
  // UseMutationOptions is not exposed from '@tanstack/angular-query-experimental'
  'mutationOptions'
>;

export const pluginTanStackAngularQueryExperimentalDefaultConfig: Required<PluginTanStackAngularQueryExperimental> =
  tanstackQueryDefaultConfig('@tanstack/angular-query-experimental');
