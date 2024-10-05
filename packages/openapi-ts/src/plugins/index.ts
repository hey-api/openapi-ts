import {
  defaultConfig as heyApiSchemasDefaultConfig,
  type PluginConfig as PluginHeyApiSchemas,
} from './@hey-api/schemas';
import {
  defaultConfig as heyApiServicesDefaultConfig,
  type PluginConfig as PluginHeyApiServices,
} from './@hey-api/services';
import {
  defaultConfig as heyApiTypesDefaultConfig,
  type PluginConfig as PluginHeyApiTypes,
} from './@hey-api/types';
import {
  defaultConfig as tanStackReactQueryDefaultConfig,
  type PluginConfig as PluginTanStackReactQuery,
  type UserConfig as TanStackReactQuery,
} from './@tanstack/react-query';
import {
  defaultConfig as tanStackSolidQueryDefaultConfig,
  type PluginConfig as PluginTanStackSolidQuery,
  type UserConfig as TanStackSolidQuery,
} from './@tanstack/solid-query';
import {
  defaultConfig as tanStackSvelteQueryDefaultConfig,
  type PluginConfig as PluginTanStackSvelteQuery,
  type UserConfig as TanStackSvelteQuery,
} from './@tanstack/svelte-query';
import {
  defaultConfig as tanStackVueQueryDefaultConfig,
  type PluginConfig as PluginTanStackVueQuery,
  type UserConfig as TanStackVueQuery,
} from './@tanstack/vue-query';
import type { DefaultPluginConfigsMap } from './types';
import {
  defaultConfig as zodDefaultConfig,
  type PluginConfig as PluginZod,
  // type UserConfig as Zod,
} from './zod';

/**
 * User-facing plugin types.
 */
export type UserPlugins =
  | TanStackReactQuery
  | TanStackSolidQuery
  | TanStackSvelteQuery
  | TanStackVueQuery;
// | Zod

export type ClientPlugins =
  | PluginHeyApiSchemas
  | PluginHeyApiServices
  | PluginHeyApiTypes
  | PluginTanStackReactQuery
  | PluginTanStackSolidQuery
  | PluginTanStackSvelteQuery
  | PluginTanStackVueQuery
  | PluginZod;

export const defaultPluginConfigs: DefaultPluginConfigsMap<ClientPlugins> = {
  '@hey-api/schemas': heyApiSchemasDefaultConfig,
  '@hey-api/services': heyApiServicesDefaultConfig,
  '@hey-api/types': heyApiTypesDefaultConfig,
  '@tanstack/react-query': tanStackReactQueryDefaultConfig,
  '@tanstack/solid-query': tanStackSolidQueryDefaultConfig,
  '@tanstack/svelte-query': tanStackSvelteQueryDefaultConfig,
  '@tanstack/vue-query': tanStackVueQueryDefaultConfig,
  zod: zodDefaultConfig,
};
