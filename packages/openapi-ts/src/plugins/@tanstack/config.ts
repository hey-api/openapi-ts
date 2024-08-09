import type { PluginTanStackAngularQueryExperimental } from './angular-query-experimental/config';
import type { PluginTanStackReactQuery } from './react-query/config';
import type { PluginTanStackSolidQuery } from './solid-query/config';
import type { PluginTanStackSvelteQuery } from './svelte-query/config';
import type { PluginTanStackVueQuery } from './vue-query/config';

export type TanstackQueryFlavor =
  | '@tanstack/angular-query-experimental'
  | '@tanstack/react-query'
  | '@tanstack/solid-query'
  | '@tanstack/svelte-query'
  | '@tanstack/vue-query';

export type PluginTanStackQueryConfig<Flavor extends TanstackQueryFlavor> = {
  /**
   * Generate {@link https://tanstack.com/query/latest/docs/framework/react/reference/infiniteQueryOptions `infiniteQueryOptions()`} helpers? These will be generated from GET and POST requests where a pagination parameter is detected.
   * @default true
   */
  infiniteQueryOptions?: boolean;
  /**
   * Generate {@link https://github.com/TanStack/query/blob/0696b514ce71dffc8acb38c55e0c93c43b781146/packages/react-query/src/types.ts#L128-L136 `mutationOptions()`} helpers? These will be generated from DELETE, PATCH, POST, and PUT requests.
   * @default true
   */
  mutationOptions?: boolean;
  /**
   * Generate TanStack Query output from the provided input.
   */
  name: Flavor;
  /**
   * Name of the generated file.
   * @default 'tanstack-query'
   */
  output?: string;
  /**
   * Generate {@link https://tanstack.com/query/latest/docs/framework/react/guides/query-options `queryOptions()`} helpers?
   * These will be generated from all requests.
   * @default true
   */
  queryOptions?: boolean;
};

export function tanstackQueryDefaultConfig(
  flavor: '@tanstack/angular-query-experimental',
): Required<PluginTanStackAngularQueryExperimental>;
export function tanstackQueryDefaultConfig(
  flavor: '@tanstack/react-query',
): Required<PluginTanStackReactQuery>;
export function tanstackQueryDefaultConfig(
  flavor: '@tanstack/solid-query',
): Required<PluginTanStackSolidQuery>;
export function tanstackQueryDefaultConfig(
  flavor: '@tanstack/svelte-query',
): Required<PluginTanStackSvelteQuery>;
export function tanstackQueryDefaultConfig(
  flavor: '@tanstack/vue-query',
): Required<PluginTanStackVueQuery>;
export function tanstackQueryDefaultConfig(flavor: TanstackQueryFlavor) {
  const queryOptions = true;
  const output = '@tanstack/query';
  const infiniteQueryOptions = true;
  const mutationOptions = true;

  switch (flavor) {
    case '@tanstack/angular-query-experimental': {
      const options: Required<PluginTanStackAngularQueryExperimental> = {
        infiniteQueryOptions,
        mutationOptions,
        name: '@tanstack/angular-query-experimental',
        output,
        queryOptions,
      };
      return options;
    }

    case '@tanstack/react-query': {
      const options: Required<PluginTanStackReactQuery> = {
        infiniteQueryOptions,
        mutationOptions,
        name: '@tanstack/react-query',
        output,
        queryOptions,
      };
      return options;
    }

    case '@tanstack/solid-query': {
      const options: Required<PluginTanStackSolidQuery> = {
        infiniteQueryOptions,
        mutationOptions,
        name: flavor,
        output,
        queryOptions,
      };
      return options;
    }

    case '@tanstack/svelte-query': {
      const options: Required<PluginTanStackSvelteQuery> = {
        infiniteQueryOptions,
        mutationOptions,
        name: flavor,
        output,
        queryOptions,
      };
      return options;
    }

    case '@tanstack/vue-query': {
      const options: Required<PluginTanStackVueQuery> = {
        infiniteQueryOptions,
        mutationOptions,
        name: flavor,
        output,
        queryOptions,
      };
      return options;
    }

    default:
      throw new Error(`Unknown tanstack query flavor '${flavor}'`);
  }
}
