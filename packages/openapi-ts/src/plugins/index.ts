import {
  type Config as HeyApiSchemas,
  defaultConfig as heyApiSchemas,
} from './@hey-api/schemas';
import {
  type Config as HeyApiServices,
  defaultConfig as heyApiServices,
} from './@hey-api/services';
import {
  type Config as HeyApiTransformers,
  defaultConfig as heyApiTransformers,
} from './@hey-api/transformers';
import {
  type Config as HeyApiTypes,
  defaultConfig as heyApiTypes,
} from './@hey-api/types';
import {
  type Config as TanStackAngularQueryExperimental,
  defaultConfig as tanStackAngularQueryExperimental,
} from './@tanstack/angular-query-experimental';
import {
  type Config as TanStackReactQuery,
  defaultConfig as tanStackReactQuery,
} from './@tanstack/react-query';
import {
  type Config as TanStackSolidQuery,
  defaultConfig as tanStackSolidQuery,
} from './@tanstack/solid-query';
import {
  type Config as TanStackSvelteQuery,
  defaultConfig as tanStackSvelteQuery,
} from './@tanstack/svelte-query';
import {
  type Config as TanStackVueQuery,
  defaultConfig as tanStackVueQuery,
} from './@tanstack/vue-query';
import { type Config as Fastify, defaultConfig as fastify } from './fastify';
import type {
  DefaultPluginConfigsMap,
  PluginConfig,
  UserConfig,
} from './types';
import { type Config as Zod, defaultConfig as zod } from './zod';

/**
 * User-facing plugin types.
 */
export type UserPlugins =
  | UserConfig<HeyApiSchemas>
  | UserConfig<HeyApiServices>
  | UserConfig<HeyApiTransformers>
  | UserConfig<HeyApiTypes>
  | UserConfig<TanStackAngularQueryExperimental>
  | UserConfig<TanStackReactQuery>
  | UserConfig<TanStackSolidQuery>
  | UserConfig<TanStackSvelteQuery>
  | UserConfig<TanStackVueQuery>
  | UserConfig<Fastify>
  | UserConfig<Zod>;

export type ClientPlugins =
  | PluginConfig<HeyApiSchemas>
  | PluginConfig<HeyApiServices>
  | PluginConfig<HeyApiTransformers>
  | PluginConfig<HeyApiTypes>
  | PluginConfig<TanStackAngularQueryExperimental>
  | PluginConfig<TanStackReactQuery>
  | PluginConfig<TanStackSolidQuery>
  | PluginConfig<TanStackSvelteQuery>
  | PluginConfig<TanStackVueQuery>
  | PluginConfig<Fastify>
  | PluginConfig<Zod>;

export const defaultPluginConfigs: DefaultPluginConfigsMap<ClientPlugins> = {
  '@hey-api/schemas': heyApiSchemas,
  '@hey-api/services': heyApiServices,
  '@hey-api/transformers': heyApiTransformers,
  '@hey-api/types': heyApiTypes,
  '@tanstack/angular-query-experimental': tanStackAngularQueryExperimental,
  '@tanstack/react-query': tanStackReactQuery,
  '@tanstack/solid-query': tanStackSolidQuery,
  '@tanstack/svelte-query': tanStackSvelteQuery,
  '@tanstack/vue-query': tanStackVueQuery,
  fastify,
  zod,
};
