import {
  type PluginTanStackQueryConfig,
  tanstackQueryDefaultConfig,
} from '../config';

export type PluginTanStackSolidQuery = Omit<
  PluginTanStackQueryConfig<'@tanstack/solid-query'>,
  // UseMutationOptions is not exposed from '@tanstack/solid-query'
  'mutationOptions'
>;

export const pluginTanStackSolidQueryDefaultConfig: Required<PluginTanStackSolidQuery> =
  tanstackQueryDefaultConfig('@tanstack/solid-query');
