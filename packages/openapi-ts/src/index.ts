// OVERRIDES
// hard-coded here because build process doesn't pick up overrides from separate files
import '@hey-api/codegen-core';

declare module '@hey-api/codegen-core' {
  interface ProjectRenderMeta {
    /**
     * If specified, this will be the file extension used when importing
     * other modules. By default, we don't add a file extension and let the
     * runtime resolve it.
     *
     * @default null
     */
    importFileExtension?: (string & {}) | null;
  }

  interface SymbolMeta {
    category?: 'external' | 'schema' | 'sdk' | 'type' | (string & {});
    /**
     * Path to the resource this symbol represents.
     */
    path?: ReadonlyArray<string | number>;
    /**
     * Name of the plugin that registered this symbol.
     */
    pluginName?: string;
    resource?:
      | 'client'
      | 'definition'
      | 'operation'
      | 'webhook'
      | (string & {});
    resourceId?: string;
    role?:
      | 'data'
      | 'error'
      | 'errors'
      | 'options'
      | 'response'
      | 'responses'
      | (string & {});
    /**
     * Tags associated with this symbol.
     */
    tags?: Set<string>;
    tool?: 'arktype' | 'typescript' | 'valibot' | 'zod' | (string & {});
    variant?: 'container' | (string & {});
  }
}
// END OVERRIDES

import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

import type { UserConfig } from '~/types/config';
import type { LazyOrAsync, MaybeArray } from '~/types/utils';

colors.enabled = colorSupport().hasBasic;

export { createClient } from './generate';

/**
 * Type helper for openapi-ts.config.ts, returns {@link MaybeArray<UserConfig>} object(s)
 */
export const defineConfig = async <T extends MaybeArray<UserConfig>>(
  config: LazyOrAsync<T>,
): Promise<T> => (typeof config === 'function' ? await config() : config);

export { defaultPaginationKeywords } from './config/parser';
export { defaultPlugins } from './config/plugins';
export type { IR } from './ir/types';
export type {
  OpenApi,
  OpenApiMetaObject,
  OpenApiOperationObject,
  OpenApiParameterObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
} from './openApi/types';
export type { DefinePlugin, Plugin } from './plugins';
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
export { definePluginConfig } from './plugins/shared/utils/config';
export { compiler, tsc } from './tsc';
export type { Operation } from './types/client';
export type { UserConfig } from './types/config';
export type { LegacyIR } from './types/types';
export { utils } from './utils/exports';
export { Logger } from './utils/logger';
