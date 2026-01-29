// OVERRIDES
// hard-coded here because build process doesn't pick up overrides from separate files
import '@hey-api/codegen-core';
import '@hey-api/shared';

declare module '@hey-api/codegen-core' {
  interface ProjectRenderMeta {
    /**
     * If specified, this will be the file extension used when importing
     * other modules. By default, we don't add a file extension and let the
     * runtime resolve it.
     *
     * @default null
     */
    importFileExtension?: AnyString | null;
  }

  interface SymbolMeta {
    category?:
      | 'client'
      | 'external'
      | 'hook'
      | 'schema'
      | 'sdk'
      | 'transform'
      | 'type'
      | 'utility'
      | AnyString;
    /**
     * Path to the resource this symbol represents.
     */
    path?: ReadonlyArray<string | number>;
    /**
     * Name of the plugin that registered this symbol.
     */
    pluginName?: string;
    resource?: 'client' | 'definition' | 'operation' | 'webhook' | AnyString;
    resourceId?: string;
    role?:
      | 'data'
      | 'error'
      | 'errors'
      | 'options'
      | 'response'
      | 'responses'
      | AnyString;
    /**
     * Tags associated with this symbol.
     */
    tags?: ReadonlyArray<string>;
    tool?:
      | 'angular'
      | 'arktype'
      | 'fastify'
      | 'json-schema'
      | 'sdk'
      | 'typescript'
      | 'valibot'
      | 'zod'
      | AnyString;
    variant?: 'container' | AnyString;
  }
}

declare module '@hey-api/shared' {
  interface PluginConfigMap {
    '@angular/common': AngularCommonPlugin['Types'];
    '@faker-js/faker': FakerJsFakerPlugin['Types'];
    '@hey-api/client-angular': HeyApiClientAngularPlugin['Types'];
    '@hey-api/client-axios': HeyApiClientAxiosPlugin['Types'];
    '@hey-api/client-fetch': HeyApiClientFetchPlugin['Types'];
    '@hey-api/client-ky': HeyApiClientKyPlugin['Types'];
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

  interface PluginInstanceTypes {
    Node: TsDsl;
  }
}
// END OVERRIDES

import type { AnyString, LazyOrAsync, MaybeArray } from '@hey-api/types';
import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

import type { UserConfig } from './config/types';
import type { AngularCommonPlugin } from './plugins/@angular/common';
import type { FakerJsFakerPlugin } from './plugins/@faker-js/faker';
import type { HeyApiClientAngularPlugin } from './plugins/@hey-api/client-angular';
import type { HeyApiClientAxiosPlugin } from './plugins/@hey-api/client-axios';
import type { HeyApiClientFetchPlugin } from './plugins/@hey-api/client-fetch';
import type { HeyApiClientKyPlugin } from './plugins/@hey-api/client-ky';
import type { HeyApiClientNextPlugin } from './plugins/@hey-api/client-next';
import type { HeyApiClientNuxtPlugin } from './plugins/@hey-api/client-nuxt';
import type { HeyApiClientOfetchPlugin } from './plugins/@hey-api/client-ofetch';
import type { HeyApiSchemasPlugin } from './plugins/@hey-api/schemas';
import type { HeyApiSdkPlugin } from './plugins/@hey-api/sdk';
import type { HeyApiTransformersPlugin } from './plugins/@hey-api/transformers';
import type { HeyApiTypeScriptPlugin } from './plugins/@hey-api/typescript';
import type { PiniaColadaPlugin } from './plugins/@pinia/colada';
import type { TanStackAngularQueryPlugin } from './plugins/@tanstack/angular-query-experimental';
import type { TanStackReactQueryPlugin } from './plugins/@tanstack/react-query';
import type { TanStackSolidQueryPlugin } from './plugins/@tanstack/solid-query';
import type { TanStackSvelteQueryPlugin } from './plugins/@tanstack/svelte-query';
import type { TanStackVueQueryPlugin } from './plugins/@tanstack/vue-query';
import type { ArktypePlugin } from './plugins/arktype';
import type { FastifyPlugin } from './plugins/fastify';
import type { SwrPlugin } from './plugins/swr';
import type { ValibotPlugin } from './plugins/valibot';
import type { ZodPlugin } from './plugins/zod';
import type { TsDsl } from './ts-dsl';

colors.enabled = colorSupport().hasBasic;

export { createClient } from './generate';

/**
 * Type helper for configuration object, returns {@link MaybeArray<UserConfig>} object(s)
 */
export async function defineConfig<T extends MaybeArray<UserConfig>>(
  config: LazyOrAsync<T>,
): Promise<T> {
  return typeof config === 'function' ? await config() : config;
}

export { defaultPlugins } from './config/plugins';
export type { UserConfig } from './config/types';
export type { AngularClient } from './plugins/@hey-api/client-angular';
export type { AxiosClient } from './plugins/@hey-api/client-axios';
export {
  clientDefaultConfig,
  clientDefaultMeta,
} from './plugins/@hey-api/client-core/config';
export { clientPluginHandler } from './plugins/@hey-api/client-core/plugin';
export type { Client } from './plugins/@hey-api/client-core/types';
export type { FetchClient } from './plugins/@hey-api/client-fetch';
export type { NextClient } from './plugins/@hey-api/client-next';
export type { NuxtClient } from './plugins/@hey-api/client-nuxt';
export type { OfetchClient } from './plugins/@hey-api/client-ofetch';
export type { ExpressionTransformer } from './plugins/@hey-api/transformers/expressions';
export type { TypeTransformer } from './plugins/@hey-api/transformers/types';
export * from './ts-dsl';
export { Logger } from '@hey-api/codegen-core';
export type {
  DefinePlugin,
  IR,
  OpenApi,
  OpenApiMetaObject,
  OpenApiOperationObject,
  OpenApiParameterObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
  Plugin,
} from '@hey-api/shared';
export {
  defaultPaginationKeywords,
  definePluginConfig,
  OperationPath,
  OperationStrategy,
  utils,
} from '@hey-api/shared';
