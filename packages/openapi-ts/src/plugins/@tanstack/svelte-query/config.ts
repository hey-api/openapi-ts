import {
  type PluginTanStackQueryConfig,
  TANSTACK_DEFAULT_INFINITE_QUERY_OPTIONS,
  TANSTACK_DEFAULT_MUTATION_OPTIONS,
  TANSTACK_DEFAULT_OUTPUT,
  TANSTACK_DEFAULT_QUERY_OPTIONS,
} from '../config';

export type PluginTanStackSvelteQuery =
  PluginTanStackQueryConfig<'@tanstack/svelte-query'>;

export const pluginTanStackSvelteQueryDefaultConfig: Required<PluginTanStackSvelteQuery> =
  {
    infiniteQueryOptions: TANSTACK_DEFAULT_INFINITE_QUERY_OPTIONS,
    mutationOptions: TANSTACK_DEFAULT_MUTATION_OPTIONS,
    name: '@tanstack/svelte-query',
    output: TANSTACK_DEFAULT_OUTPUT,
    queryOptions: TANSTACK_DEFAULT_QUERY_OPTIONS,
  };
