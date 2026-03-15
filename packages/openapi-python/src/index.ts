/* eslint-disable @typescript-eslint/no-namespace */
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
    role?: 'data' | 'error' | 'errors' | 'options' | 'response' | 'responses' | AnyString;
    /**
     * Tags associated with this symbol.
     */
    tags?: ReadonlyArray<string>;
    tool?: 'pydantic' | 'sdk' | AnyString;
    variant?: 'container' | AnyString;
  }
}

declare module '@hey-api/shared' {
  interface PluginConfigMap {
    '@hey-api/client-httpx': Plugins.HeyApiClientHttpx.Types['Types'];
    '@hey-api/python-sdk': Plugins.HeyApiSdk.Types['Types'];
    pydantic: Plugins.Pydantic.Types['Types'];
  }
}
// END OVERRIDES

import type { AnyString, LazyOrAsync, MaybeArray } from '@hey-api/types';
import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

import type { UserConfig } from './config/types';
import type { HeyApiClientHttpxPlugin } from './plugins/@hey-api/client-httpx';
import type { HeyApiSdkPlugin } from './plugins/@hey-api/sdk';
import type { PydanticPlugin, PydanticResolvers } from './plugins/pydantic';

colors.enabled = colorSupport().hasBasic;

export { createClient } from './generate';

/**
 * Type helper for configuration object, returns {@link MaybeArray<UserConfig>} object(s)
 */
export function defineConfig(
  config: LazyOrAsync<ReadonlyArray<UserConfig>>,
): Promise<ReadonlyArray<UserConfig>>;
export function defineConfig(config: LazyOrAsync<UserConfig>): Promise<UserConfig>;
export async function defineConfig<T extends MaybeArray<UserConfig>>(
  config: LazyOrAsync<T>,
): Promise<T> {
  return typeof config === 'function' ? await config() : config;
}

export { defaultPlugins } from './config/plugins';
export type { UserConfig } from './config/types';
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

export namespace Plugins {
  export namespace HeyApiClientHttpx {
    export type Types = HeyApiClientHttpxPlugin;
  }

  export namespace HeyApiSdk {
    export type Types = HeyApiSdkPlugin;
  }

  export namespace Pydantic {
    export type Resolvers = Required<PydanticResolvers>['~resolvers'];
    export type Types = PydanticPlugin;
  }
}
