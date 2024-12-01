import type { IRContext } from '../ir/context';
import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';

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

interface BaseConfig {
  // eslint-disable-next-line @typescript-eslint/ban-types
  name: PluginNames | (string & {});
  output?: string;
}

interface Dependencies {
  /**
   * Required dependencies will be always processed, regardless of whether
   * a user defines them in their `plugins` config.
   */
  _dependencies?: ReadonlyArray<PluginNames>;
  /**
   * Optional dependencies are not processed unless a user explicitly defines
   * them in their `plugins` config.
   */
  _optionalDependencies?: ReadonlyArray<PluginNames>;
}

export type DefaultPluginConfigs<T> = {
  [K in PluginNames]: BaseConfig &
    Dependencies & {
      _handler: Plugin.Handler<Required<Extract<T, { name: K }>>>;
      _handlerLegacy: Plugin.LegacyHandler<Required<Extract<T, { name: K }>>>;
    };
};

/**
 * Public Plugin API.
 */
export namespace Plugin {
  export type Config<Config extends BaseConfig> = Config &
    Dependencies & {
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

  export type Instance<Config extends BaseConfig> = Omit<
    Config,
    '_dependencies' | '_handler' | '_handlerLegacy' | '_optionalDependencies'
  > &
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
