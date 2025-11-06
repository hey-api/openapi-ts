import type { Plugin } from '~/plugins';
import type { AngularCommonPlugin } from '~/plugins/@angular/common';
import { defaultConfig as angularCommon } from '~/plugins/@angular/common';
import type { HeyApiClientAngularPlugin } from '~/plugins/@hey-api/client-angular';
import { defaultConfig as heyApiClientAngular } from '~/plugins/@hey-api/client-angular';
import type { HeyApiClientAxiosPlugin } from '~/plugins/@hey-api/client-axios';
import { defaultConfig as heyApiClientAxios } from '~/plugins/@hey-api/client-axios';
import type { HeyApiClientFetchPlugin } from '~/plugins/@hey-api/client-fetch';
import { defaultConfig as heyApiClientFetch } from '~/plugins/@hey-api/client-fetch';
import type { HeyApiClientNextPlugin } from '~/plugins/@hey-api/client-next';
import { defaultConfig as heyApiClientNext } from '~/plugins/@hey-api/client-next';
import type { HeyApiClientNuxtPlugin } from '~/plugins/@hey-api/client-nuxt';
import { defaultConfig as heyApiClientNuxt } from '~/plugins/@hey-api/client-nuxt';
import type { HeyApiClientOfetchPlugin } from '~/plugins/@hey-api/client-ofetch';
import { defaultConfig as heyApiClientOfetch } from '~/plugins/@hey-api/client-ofetch';
import type { HeyApiSchemasPlugin } from '~/plugins/@hey-api/schemas';
import { defaultConfig as heyApiSchemas } from '~/plugins/@hey-api/schemas';
import type { HeyApiSdkPlugin } from '~/plugins/@hey-api/sdk';
import { defaultConfig as heyApiSdk } from '~/plugins/@hey-api/sdk';
import type { HeyApiTransformersPlugin } from '~/plugins/@hey-api/transformers';
import { defaultConfig as heyApiTransformers } from '~/plugins/@hey-api/transformers';
import type { HeyApiTypeScriptPlugin } from '~/plugins/@hey-api/typescript';
import { defaultConfig as heyApiTypeScript } from '~/plugins/@hey-api/typescript';
import type { PiniaColadaPlugin } from '~/plugins/@pinia/colada';
import { defaultConfig as piniaColada } from '~/plugins/@pinia/colada';
import type { TanStackAngularQueryPlugin } from '~/plugins/@tanstack/angular-query-experimental';
import { defaultConfig as tanStackAngularQuery } from '~/plugins/@tanstack/angular-query-experimental';
import type { TanStackReactQueryPlugin } from '~/plugins/@tanstack/react-query';
import { defaultConfig as tanStackReactQuery } from '~/plugins/@tanstack/react-query';
import type { TanStackSolidQueryPlugin } from '~/plugins/@tanstack/solid-query';
import { defaultConfig as tanStackSolidQuery } from '~/plugins/@tanstack/solid-query';
import type { TanStackSvelteQueryPlugin } from '~/plugins/@tanstack/svelte-query';
import { defaultConfig as tanStackSvelteQuery } from '~/plugins/@tanstack/svelte-query';
import type { TanStackVueQueryPlugin } from '~/plugins/@tanstack/vue-query';
import { defaultConfig as tanStackVueQuery } from '~/plugins/@tanstack/vue-query';
import type { ArktypePlugin } from '~/plugins/arktype';
import { defaultConfig as arktype } from '~/plugins/arktype';
import type { FastifyPlugin } from '~/plugins/fastify';
import { defaultConfig as fastify } from '~/plugins/fastify';
import type { SwrPlugin } from '~/plugins/swr';
import { defaultConfig as swr } from '~/plugins/swr';
import type { PluginNames } from '~/plugins/types';
import type { ValibotPlugin } from '~/plugins/valibot';
import { defaultConfig as valibot } from '~/plugins/valibot';
import type { ZodPlugin } from '~/plugins/zod';
import { defaultConfig as zod } from '~/plugins/zod';

export interface PluginConfigMap {
  '@angular/common': AngularCommonPlugin['Types'];
  '@hey-api/client-angular': HeyApiClientAngularPlugin['Types'];
  '@hey-api/client-axios': HeyApiClientAxiosPlugin['Types'];
  '@hey-api/client-fetch': HeyApiClientFetchPlugin['Types'];
  '@hey-api/client-next': HeyApiClientNextPlugin['Types'];
  '@hey-api/client-nuxt': HeyApiClientNuxtPlugin['Types'];
  '@hey-api/client-ofetch': HeyApiClientOfetchPlugin['Types'];
  '@hey-api/schemas': HeyApiSchemasPlugin['Types'];
  '@hey-api/sdk': HeyApiSdkPlugin['Types'];
  '@hey-api/transformers': HeyApiTransformersPlugin['Types'];
  '@hey-api/typescript': HeyApiTypeScriptPlugin['Types'];
  '@pinia/colada': PiniaColadaPlugin['Types'];
  '@tanstack/angular-query-experimental': TanStackAngularQueryPlugin['Types'];
  '@tanstack/react-query': TanStackReactQueryPlugin['Types'];
  '@tanstack/solid-query': TanStackSolidQueryPlugin['Types'];
  '@tanstack/svelte-query': TanStackSvelteQueryPlugin['Types'];
  '@tanstack/vue-query': TanStackVueQueryPlugin['Types'];
  arktype: ArktypePlugin['Types'];
  fastify: FastifyPlugin['Types'];
  swr: SwrPlugin['Types'];
  valibot: ValibotPlugin['Types'];
  zod: ZodPlugin['Types'];
}

export const defaultPluginConfigs: {
  [K in PluginNames]: Plugin.Config<PluginConfigMap[K]>;
} = {
  '@angular/common': angularCommon,
  '@hey-api/client-angular': heyApiClientAngular,
  '@hey-api/client-axios': heyApiClientAxios,
  '@hey-api/client-fetch': heyApiClientFetch,
  '@hey-api/client-next': heyApiClientNext,
  '@hey-api/client-nuxt': heyApiClientNuxt,
  '@hey-api/client-ofetch': heyApiClientOfetch,
  '@hey-api/schemas': heyApiSchemas,
  '@hey-api/sdk': heyApiSdk,
  '@hey-api/transformers': heyApiTransformers,
  '@hey-api/typescript': heyApiTypeScript,
  '@pinia/colada': piniaColada,
  '@tanstack/angular-query-experimental': tanStackAngularQuery,
  '@tanstack/react-query': tanStackReactQuery,
  '@tanstack/solid-query': tanStackSolidQuery,
  '@tanstack/svelte-query': tanStackSvelteQuery,
  '@tanstack/vue-query': tanStackVueQuery,
  arktype,
  fastify,
  swr,
  valibot,
  zod,
};
