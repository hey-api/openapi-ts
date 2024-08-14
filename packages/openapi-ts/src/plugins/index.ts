import {
  type PluginTanStackReactQuery,
  pluginTanStackReactQueryDefaultConfig,
} from './@tanstack/react-query/config';
import {
  type PluginTanStackSolidQuery,
  pluginTanStackSolidQueryDefaultConfig,
} from './@tanstack/solid-query/config';
import {
  type PluginTanStackSvelteQuery,
  pluginTanStackSvelteQueryDefaultConfig,
} from './@tanstack/svelte-query/config';
import {
  type PluginTanStackVueQuery,
  pluginTanStackVueQueryDefaultConfig,
} from './@tanstack/vue-query/config';
import type { DefaultPluginConfigsMap } from './types';

export type Plugins =
  | PluginTanStackReactQuery
  | PluginTanStackSolidQuery
  | PluginTanStackSvelteQuery
  | PluginTanStackVueQuery;

export const defaultPluginConfigs: DefaultPluginConfigsMap<Plugins> = {
  '@tanstack/react-query': pluginTanStackReactQueryDefaultConfig,
  '@tanstack/solid-query': pluginTanStackSolidQueryDefaultConfig,
  '@tanstack/svelte-query': pluginTanStackSvelteQueryDefaultConfig,
  '@tanstack/vue-query': pluginTanStackVueQueryDefaultConfig,
};
