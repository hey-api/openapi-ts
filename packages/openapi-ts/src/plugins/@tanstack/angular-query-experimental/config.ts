import {
  type PluginTanStackQueryConfig,
  TANSTACK_DEFAULT_INFINITE_QUERY_OPTIONS,
  TANSTACK_DEFAULT_MUTATION_OPTIONS,
  TANSTACK_DEFAULT_OUTPUT,
  TANSTACK_DEFAULT_QUERY_OPTIONS,
} from '../config';

export type PluginTanStackAngularQueryExperimental =
  PluginTanStackQueryConfig<'@tanstack/angular-query-experimental'>;

export const pluginTanStackAngularQueryExperimentalDefaultConfig: Required<PluginTanStackAngularQueryExperimental> =
  {
    infiniteQueryOptions: TANSTACK_DEFAULT_INFINITE_QUERY_OPTIONS,
    mutationOptions: TANSTACK_DEFAULT_MUTATION_OPTIONS,
    name: '@tanstack/angular-query-experimental',
    output: TANSTACK_DEFAULT_OUTPUT,
    queryOptions: TANSTACK_DEFAULT_QUERY_OPTIONS,
  };
