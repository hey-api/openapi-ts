import {
  type Config as HeyApiSchemas,
  defaultConfig as heyApiSchemas,
} from './@hey-api/schemas';
import {
  type Config as HeyApiSdk,
  defaultConfig as heyApiSdk,
} from './@hey-api/sdk';
import {
  type Config as HeyApiTransformers,
  defaultConfig as heyApiTransformers,
} from './@hey-api/transformers';
import {
  type Config as HeyApiTypeScript,
  defaultConfig as heyApiTypeScript,
} from './@hey-api/typescript';
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
import type { DefaultPluginConfigs, Plugin } from './types';
import { type Config as Zod, defaultConfig as zod } from './zod';

/**
 * User-facing plugin types.
 */
export type UserPlugins =
  | Plugin.UserConfig<HeyApiSchemas>
  | Plugin.UserConfig<HeyApiSdk>
  | Plugin.UserConfig<HeyApiTransformers>
  | Plugin.UserConfig<HeyApiTypeScript>
  | Plugin.UserConfig<TanStackAngularQueryExperimental>
  | Plugin.UserConfig<TanStackReactQuery>
  | Plugin.UserConfig<TanStackSolidQuery>
  | Plugin.UserConfig<TanStackSvelteQuery>
  | Plugin.UserConfig<TanStackVueQuery>
  | Plugin.UserConfig<Fastify>
  | Plugin.UserConfig<Zod>;

/**
 * Internal plugin types.
 */
export type ClientPlugins =
  | Plugin.Config<HeyApiSchemas>
  | Plugin.Config<HeyApiSdk>
  | Plugin.Config<HeyApiTransformers>
  | Plugin.Config<HeyApiTypeScript>
  | Plugin.Config<TanStackAngularQueryExperimental>
  | Plugin.Config<TanStackReactQuery>
  | Plugin.Config<TanStackSolidQuery>
  | Plugin.Config<TanStackSvelteQuery>
  | Plugin.Config<TanStackVueQuery>
  | Plugin.Config<Fastify>
  | Plugin.Config<Zod>;

export const defaultPluginConfigs: DefaultPluginConfigs<ClientPlugins> = {
  '@hey-api/schemas': heyApiSchemas,
  '@hey-api/sdk': heyApiSdk,
  '@hey-api/transformers': heyApiTransformers,
  '@hey-api/typescript': heyApiTypeScript,
  '@tanstack/angular-query-experimental': tanStackAngularQueryExperimental,
  '@tanstack/react-query': tanStackReactQuery,
  '@tanstack/solid-query': tanStackSolidQuery,
  '@tanstack/svelte-query': tanStackSvelteQuery,
  '@tanstack/vue-query': tanStackVueQuery,
  fastify,
  zod,
};
