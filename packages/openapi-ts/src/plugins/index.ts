import {
  defaultConfig as heyApiSchemasDefaultConfig,
  type PluginConfig as HeyApiSchemas,
} from './@hey-api/schemas';
import {
  defaultConfig as heyApiServicesDefaultConfig,
  type PluginConfig as HeyApiServices,
} from './@hey-api/services';
import {
  defaultConfig as heyApiTypesDefaultConfig,
  type PluginConfig as HeyApiTypes,
} from './@hey-api/types';
import {
  defaultConfig as tanStackReactQueryDefaultConfig,
  type PluginConfig as TanStackReactQuery,
} from './@tanstack/react-query';
import {
  defaultConfig as tanStackSolidQueryDefaultConfig,
  type PluginConfig as TanStackSolidQuery,
} from './@tanstack/solid-query';
import {
  defaultConfig as tanStackSvelteQueryDefaultConfig,
  type PluginConfig as TanStackSvelteQuery,
} from './@tanstack/svelte-query';
import {
  defaultConfig as tanStackVueQueryDefaultConfig,
  type PluginConfig as TanStackVueQuery,
} from './@tanstack/vue-query';
import type { DefaultPluginConfigsMap } from './types';

export type Plugins =
  | HeyApiSchemas
  | HeyApiServices
  | HeyApiTypes
  | TanStackReactQuery
  | TanStackSolidQuery
  | TanStackSvelteQuery
  | TanStackVueQuery;

export const defaultPluginConfigs: DefaultPluginConfigsMap<Plugins> = {
  '@hey-api/schemas': heyApiSchemasDefaultConfig,
  '@hey-api/services': heyApiServicesDefaultConfig,
  '@hey-api/types': heyApiTypesDefaultConfig,
  '@tanstack/react-query': tanStackReactQueryDefaultConfig,
  '@tanstack/solid-query': tanStackSolidQueryDefaultConfig,
  '@tanstack/svelte-query': tanStackSvelteQueryDefaultConfig,
  '@tanstack/vue-query': tanStackVueQueryDefaultConfig,
};
