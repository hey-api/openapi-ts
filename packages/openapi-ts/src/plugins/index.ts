import {
  type Config as HeyApiClientAxios,
  defaultConfig as heyApiClientAxios,
} from './@hey-api/client-axios';
import {
  type Config as HeyApiClientFetch,
  defaultConfig as heyApiClientFetch,
} from './@hey-api/client-fetch';
import {
  type Config as HeyApiClientNext,
  defaultConfig as heyApiClientNext,
} from './@hey-api/client-next';
import {
  type Config as HeyApiClientNuxt,
  defaultConfig as heyApiClientNuxt,
} from './@hey-api/client-nuxt';
import {
  type Config as HeyApiLegacyAngular,
  defaultConfig as heyApiLegacyAngular,
} from './@hey-api/legacy-angular';
import {
  type Config as HeyApiLegacyAxios,
  defaultConfig as heyApiLegacyAxios,
} from './@hey-api/legacy-axios';
import {
  type Config as HeyApiLegacyFetch,
  defaultConfig as heyApiLegacyFetch,
} from './@hey-api/legacy-fetch';
import {
  type Config as HeyApiLegacyNode,
  defaultConfig as heyApiLegacyNode,
} from './@hey-api/legacy-node';
import {
  type Config as HeyApiLegacyXhr,
  defaultConfig as heyApiLegacyXhr,
} from './@hey-api/legacy-xhr';
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
import { type Config as Valibot, defaultConfig as valibot } from './valibot';
import { type Config as Zod, defaultConfig as zod } from './zod';

/**
 * User-facing plugin types.
 */
export type UserPlugins =
  | Plugin.UserConfig<HeyApiClientAxios>
  | Plugin.UserConfig<HeyApiClientFetch>
  | Plugin.UserConfig<HeyApiClientNext>
  | Plugin.UserConfig<HeyApiClientNuxt>
  | Plugin.UserConfig<HeyApiLegacyAngular>
  | Plugin.UserConfig<HeyApiLegacyAxios>
  | Plugin.UserConfig<HeyApiLegacyFetch>
  | Plugin.UserConfig<HeyApiLegacyNode>
  | Plugin.UserConfig<HeyApiLegacyXhr>
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
  | Plugin.UserConfig<Valibot>
  | Plugin.UserConfig<Zod>;

/**
 * Internal plugin types.
 */
export type ClientPlugins =
  | Plugin.Config<HeyApiClientAxios>
  | Plugin.Config<HeyApiClientFetch>
  | Plugin.Config<HeyApiClientNext>
  | Plugin.Config<HeyApiClientNuxt>
  | Plugin.Config<HeyApiLegacyAngular>
  | Plugin.Config<HeyApiLegacyAxios>
  | Plugin.Config<HeyApiLegacyFetch>
  | Plugin.Config<HeyApiLegacyNode>
  | Plugin.Config<HeyApiLegacyXhr>
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
  | Plugin.Config<Valibot>
  | Plugin.Config<Zod>;

export const defaultPluginConfigs: DefaultPluginConfigs<ClientPlugins> = {
  '@hey-api/client-axios': heyApiClientAxios,
  '@hey-api/client-fetch': heyApiClientFetch,
  '@hey-api/client-next': heyApiClientNext,
  '@hey-api/client-nuxt': heyApiClientNuxt,
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
  'legacy/angular': heyApiLegacyAngular,
  'legacy/axios': heyApiLegacyAxios,
  'legacy/fetch': heyApiLegacyFetch,
  'legacy/node': heyApiLegacyNode,
  'legacy/xhr': heyApiLegacyXhr,
  valibot,
  zod,
};
