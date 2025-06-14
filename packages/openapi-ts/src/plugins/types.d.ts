import type { IR } from '../ir/types';
import type { OpenApi as LegacyOpenApi } from '../openApi';
import type { OpenApi } from '../openApi/types';
import type { Client as LegacyClient } from '../types/client';
import type { Files } from '../types/utils';

type OmitUnderscoreKeys<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K];
};

export type PluginClientNames =
  | '@hey-api/client-axios'
  | '@hey-api/client-fetch'
  | '@hey-api/client-next'
  | '@hey-api/client-nuxt'
  | 'legacy/angular'
  | 'legacy/axios'
  | 'legacy/fetch'
  | 'legacy/node'
  | 'legacy/xhr';

export type PluginValidatorNames = 'valibot' | 'zod';

export type PluginNames =
  | PluginClientNames
  | '@hey-api/schemas'
  | '@hey-api/sdk'
  | '@hey-api/transformers'
  | '@hey-api/typescript'
  | '@tanstack/angular-query-experimental'
  | '@tanstack/react-query'
  | '@tanstack/solid-query'
  | '@tanstack/svelte-query'
  | '@tanstack/vue-query'
  | 'fastify'
  | PluginValidatorNames;

export type AnyPluginName = PluginNames | (string & {});

type PluginTag = 'client' | 'transformer' | 'validator';

export interface PluginContext {
  ensureDependency: (name: PluginNames | true) => void;
  pluginByTag: (props: {
    defaultPlugin?: AnyPluginName;
    errorMessage?: string;
    tag: PluginTag;
  }) => AnyPluginName | undefined;
}

export interface BaseConfig {
  /**
   * Should the exports from the plugin's file be re-exported in the index
   * barrel file?
   */
  exportFromIndex?: boolean;
  name: AnyPluginName;
  output?: string;
}

interface Meta<Config extends BaseConfig> {
  /**
   * Dependency plugins will be always processed, regardless of whether user
   * explicitly defines them in their `plugins` config.
   */
  _dependencies?: ReadonlyArray<AnyPluginName>;
  /**
   * Allows overriding config before it's sent to the parser. An example is
   * defining `validator` as `true` and the plugin figures out which plugin
   * should be used for validation.
   */
  _infer?: (config: Plugin.Config<Config>, context: PluginContext) => void;
  /**
   * Optional tags can be used to help with deciding plugin order and inferring
   * plugin configuration options.
   */
  _tags?: ReadonlyArray<PluginTag>;
}

/**
 * Public Plugin API.
 */
export namespace Plugin {
  export type Config<Config extends BaseConfig> = Pick<
    Config,
    'name' | 'output'
  > &
    Meta<Config> & {
      _handler: Plugin.Handler<Config>;
      _handlerLegacy: Plugin.LegacyHandler<Config>;
      config: Omit<Config, 'name' | 'output'>;
    };

  /** @deprecated - use `definePluginConfig()` instead */
  export type DefineConfig<Config extends BaseConfig> = (
    config?: Plugin.UserConfig<Omit<Config, 'name'>>,
  ) => Omit<Plugin.Config<Config>, 'name'> & {
    /**
     * Cast name to `any` so it doesn't throw type error in `plugins` array.
     * We could allow any `string` as plugin `name` in the object syntax, but
     * that TypeScript trick would cause all string methods to appear as
     * suggested auto completions, which is undesirable.
     */
    name: any;
  };

  /**
   * Plugin implementation for experimental parser.
   */
  export type Handler<Config extends BaseConfig, ReturnType = void> = (args: {
    context: IR.Context<OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X>;
    plugin: Plugin.Instance<Config>;
  }) => ReturnType;

  export type Instance<Config extends BaseConfig> = OmitUnderscoreKeys<
    Plugin.Config<Config>
  > &
    Pick<Required<BaseConfig>, 'name' | 'output'>;

  /**
   * Plugin implementation for legacy parser.
   *
   * @deprecated
   */
  export type LegacyHandler<Config extends BaseConfig> = (args: {
    client: LegacyClient;
    files: Files;
    openApi: LegacyOpenApi;
    plugin: Plugin.Instance<Config>;
  }) => void;

  export interface Name<Name extends PluginNames> {
    name: Name;
  }

  /**
   * Users cannot modify output file path to avoid risk of conflicts.
   */
  export type UserConfig<Config extends BaseConfig> = Omit<Config, 'output'>;
}
