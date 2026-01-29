import type { Plugin, PluginConfigMap, PluginNames } from '@hey-api/shared';

import { defaultConfig as angularCommon } from '../plugins/@angular/common';
import { defaultConfig as fakerJsFaker } from '../plugins/@faker-js/faker';
import { defaultConfig as heyApiClientAngular } from '../plugins/@hey-api/client-angular';
import { defaultConfig as heyApiClientAxios } from '../plugins/@hey-api/client-axios';
import { defaultConfig as heyApiClientFetch } from '../plugins/@hey-api/client-fetch';
import { defaultConfig as heyApiClientKy } from '../plugins/@hey-api/client-ky';
import { defaultConfig as heyApiClientNext } from '../plugins/@hey-api/client-next';
import { defaultConfig as heyApiClientNuxt } from '../plugins/@hey-api/client-nuxt';
import { defaultConfig as heyApiClientOfetch } from '../plugins/@hey-api/client-ofetch';
import { defaultConfig as heyApiSchemas } from '../plugins/@hey-api/schemas';
import { defaultConfig as heyApiSdk } from '../plugins/@hey-api/sdk';
import { defaultConfig as heyApiTransformers } from '../plugins/@hey-api/transformers';
import { defaultConfig as heyApiTypeScript } from '../plugins/@hey-api/typescript';
import { defaultConfig as piniaColada } from '../plugins/@pinia/colada';
import { defaultConfig as tanStackAngularQuery } from '../plugins/@tanstack/angular-query-experimental';
import { defaultConfig as tanStackReactQuery } from '../plugins/@tanstack/react-query';
import { defaultConfig as tanStackSolidQuery } from '../plugins/@tanstack/solid-query';
import { defaultConfig as tanStackSvelteQuery } from '../plugins/@tanstack/svelte-query';
import { defaultConfig as tanStackVueQuery } from '../plugins/@tanstack/vue-query';
import { defaultConfig as arktype } from '../plugins/arktype';
import { defaultConfig as fastify } from '../plugins/fastify';
import { defaultConfig as swr } from '../plugins/swr';
import { defaultConfig as valibot } from '../plugins/valibot';
import { defaultConfig as zod } from '../plugins/zod';

export const defaultPluginConfigs: {
  [K in PluginNames]: Plugin.Config<PluginConfigMap[K]>;
} = {
  '@angular/common': angularCommon,
  '@faker-js/faker': fakerJsFaker,
  '@hey-api/client-angular': heyApiClientAngular,
  '@hey-api/client-axios': heyApiClientAxios,
  '@hey-api/client-fetch': heyApiClientFetch,
  '@hey-api/client-ky': heyApiClientKy,
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
