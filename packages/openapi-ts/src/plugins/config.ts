import type { HeyApiClientAxiosPlugin } from './@hey-api/client-axios';
import { defaultConfig as heyApiClientAxios } from './@hey-api/client-axios';
import type { HeyApiClientFetchPlugin } from './@hey-api/client-fetch';
import { defaultConfig as heyApiClientFetch } from './@hey-api/client-fetch';
import type { HeyApiClientNextPlugin } from './@hey-api/client-next';
import { defaultConfig as heyApiClientNext } from './@hey-api/client-next';
import type { HeyApiClientNuxtPlugin } from './@hey-api/client-nuxt';
import { defaultConfig as heyApiClientNuxt } from './@hey-api/client-nuxt';
import type { HeyApiClientLegacyAngularPlugin } from './@hey-api/legacy-angular';
import { defaultConfig as heyApiLegacyAngular } from './@hey-api/legacy-angular';
import type { HeyApiClientLegacyAxiosPlugin } from './@hey-api/legacy-axios';
import { defaultConfig as heyApiLegacyAxios } from './@hey-api/legacy-axios';
import type { HeyApiClientLegacyFetchPlugin } from './@hey-api/legacy-fetch';
import { defaultConfig as heyApiLegacyFetch } from './@hey-api/legacy-fetch';
import type { HeyApiClientLegacyNodePlugin } from './@hey-api/legacy-node';
import { defaultConfig as heyApiLegacyNode } from './@hey-api/legacy-node';
import type { HeyApiClientLegacyXhrPlugin } from './@hey-api/legacy-xhr';
import { defaultConfig as heyApiLegacyXhr } from './@hey-api/legacy-xhr';
import type { HeyApiSchemasPlugin } from './@hey-api/schemas';
import { defaultConfig as heyApiSchemas } from './@hey-api/schemas';
import type { HeyApiSdkPlugin } from './@hey-api/sdk';
import { defaultConfig as heyApiSdk } from './@hey-api/sdk';
import type { HeyApiTransformersPlugin } from './@hey-api/transformers';
import { defaultConfig as heyApiTransformers } from './@hey-api/transformers';
import type { HeyApiTypeScriptPlugin } from './@hey-api/typescript';
import { defaultConfig as heyApiTypeScript } from './@hey-api/typescript';
import type { TanStackAngularQueryPlugin } from './@tanstack/angular-query-experimental';
import { defaultConfig as tanStackAngularQuery } from './@tanstack/angular-query-experimental';
import type { TanStackReactQueryPlugin } from './@tanstack/react-query';
import { defaultConfig as tanStackReactQuery } from './@tanstack/react-query';
import type { TanStackSolidQueryPlugin } from './@tanstack/solid-query';
import { defaultConfig as tanStackSolidQuery } from './@tanstack/solid-query';
import type { TanStackSvelteQueryPlugin } from './@tanstack/svelte-query';
import { defaultConfig as tanStackSvelteQuery } from './@tanstack/svelte-query';
import type { TanStackVueQueryPlugin } from './@tanstack/vue-query';
import { defaultConfig as tanStackVueQuery } from './@tanstack/vue-query';
import type { FastifyPlugin } from './fastify';
import { defaultConfig as fastify } from './fastify';
import type { Plugin, PluginNames } from './types';
import type { ValibotPlugin } from './valibot';
import { defaultConfig as valibot } from './valibot';
import type { ZodPlugin } from './zod';
import { defaultConfig as zod } from './zod';

export interface PluginConfigMap {
  '@hey-api/client-axios': HeyApiClientAxiosPlugin;
  '@hey-api/client-fetch': HeyApiClientFetchPlugin;
  '@hey-api/client-next': HeyApiClientNextPlugin;
  '@hey-api/client-nuxt': HeyApiClientNuxtPlugin;
  '@hey-api/schemas': HeyApiSchemasPlugin;
  '@hey-api/sdk': HeyApiSdkPlugin;
  '@hey-api/transformers': HeyApiTransformersPlugin;
  '@hey-api/typescript': HeyApiTypeScriptPlugin;
  '@tanstack/angular-query-experimental': TanStackAngularQueryPlugin;
  '@tanstack/react-query': TanStackReactQueryPlugin;
  '@tanstack/solid-query': TanStackSolidQueryPlugin;
  '@tanstack/svelte-query': TanStackSvelteQueryPlugin;
  '@tanstack/vue-query': TanStackVueQueryPlugin;
  fastify: FastifyPlugin;
  'legacy/angular': HeyApiClientLegacyAngularPlugin;
  'legacy/axios': HeyApiClientLegacyAxiosPlugin;
  'legacy/fetch': HeyApiClientLegacyFetchPlugin;
  'legacy/node': HeyApiClientLegacyNodePlugin;
  'legacy/xhr': HeyApiClientLegacyXhrPlugin;
  valibot: ValibotPlugin;
  zod: ZodPlugin;
}

export const defaultPluginConfigs: {
  [K in PluginNames]: Plugin.Config<PluginConfigMap[K]>;
} = {
  '@hey-api/client-axios': heyApiClientAxios,
  '@hey-api/client-fetch': heyApiClientFetch,
  '@hey-api/client-next': heyApiClientNext,
  '@hey-api/client-nuxt': heyApiClientNuxt,
  '@hey-api/schemas': heyApiSchemas,
  '@hey-api/sdk': heyApiSdk,
  '@hey-api/transformers': heyApiTransformers,
  '@hey-api/typescript': heyApiTypeScript,
  '@tanstack/angular-query-experimental': tanStackAngularQuery,
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
