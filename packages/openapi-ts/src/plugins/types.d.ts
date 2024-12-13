import type { IRContext } from '../ir/context';
import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';

type OmitUnderscoreKeys<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K];
};

export type PluginNames =
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
  | 'zod';

type PluginTag = 'transformer' | 'validator';

export interface PluginContext {
  ensureDependency: (name: PluginNames | true) => void;
  pluginByTag: (tag: PluginTag) => PluginNames | undefined;
}

interface BaseConfig {
  // eslint-disable-next-line @typescript-eslint/ban-types
  name: PluginNames | (string & {});
  output?: string;
}

interface Meta<Config extends BaseConfig> {
  /**
   * Dependency plugins will be always processed, regardless of whether user
   * explicitly defines them in their `plugins` config.
   */
  _dependencies?: ReadonlyArray<PluginNames>;
  /**
   * Allows overriding config before it's sent to the parser. An example is
   * defining `validator` as `true` and the plugin figures out which plugin
   * should be used for validation.
   */
  _infer?: (
    config: Config & Omit<Meta<Config>, '_infer'>,
    context: PluginContext,
  ) => void;
  /**
   * Optional tags can be used to help with deciding plugin order and inferring
   * plugin configuration options.
   */
  _tags?: ReadonlyArray<PluginTag>;
}

export type DefaultPluginConfigs<T> = {
  [K in PluginNames]: BaseConfig &
    Meta<any> & {
      _handler: Plugin.Handler<Required<Extract<T, { name: K }>>>;
      _handlerLegacy: Plugin.LegacyHandler<Required<Extract<T, { name: K }>>>;
    };
};

/**
 * Public Plugin API.
 */
export namespace Plugin {
  export type Config<Config extends BaseConfig> = Config &
    Meta<Config> & {
      _handler: Plugin.Handler<Config>;
      _handlerLegacy: Plugin.LegacyHandler<Config>;
    };

  export type DefineConfig<Config extends BaseConfig> = (
    config?: Plugin.UserConfig<Config>,
  ) => Plugin.Config<Config>;

  /**
   * Plugin implementation for experimental parser.
   */
  export type Handler<Config extends BaseConfig> = (args: {
    context: IRContext;
    plugin: Plugin.Instance<Config>;
  }) => void;

  export type Instance<Config extends BaseConfig> = OmitUnderscoreKeys<Config> &
    Pick<Required<Config>, 'output'>;

  /**
   * Plugin implementation for legacy parser. Use only if you need to support
   * OpenAPI 2.0 since that isn't supported by the experimental parser yet.
   */
  export type LegacyHandler<Config extends BaseConfig> = (args: {
    client: Client;
    files: Files;
    openApi: OpenApi;
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
