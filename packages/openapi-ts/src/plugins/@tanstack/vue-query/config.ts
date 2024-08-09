import {
  type PluginTanStackQueryConfig,
  TANSTACK_DEFAULT_INFINITE_QUERY_OPTIONS,
  TANSTACK_DEFAULT_MUTATION_OPTIONS,
  TANSTACK_DEFAULT_OUTPUT,
  TANSTACK_DEFAULT_QUERY_OPTIONS,
} from '../config';

export type PluginTanStackVueQuery =
  PluginTanStackQueryConfig<'@tanstack/vue-query'>;

export const pluginTanStackVueQueryDefaultConfig: Required<PluginTanStackVueQuery> =
  {
    infiniteQueryOptions: TANSTACK_DEFAULT_INFINITE_QUERY_OPTIONS,
    mutationOptions: TANSTACK_DEFAULT_MUTATION_OPTIONS,
    name: '@tanstack/vue-query',
    output: TANSTACK_DEFAULT_OUTPUT,
    queryOptions: TANSTACK_DEFAULT_QUERY_OPTIONS,
  };
