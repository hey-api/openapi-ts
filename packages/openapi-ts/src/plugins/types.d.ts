import type { IRContext } from '../ir/context';
import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';

export type PluginLegacyHandler<PluginConfig extends CommonConfig> = (args: {
  client: Client;
  files: Files;
  openApi: OpenApi;
  plugin: Omit<
    PluginConfig,
    '_dependencies' | '_handler' | '_handlerLegacy' | '_optionalDependencies'
  > &
    Pick<Required<PluginConfig>, 'output'>;
}) => void;

export type PluginHandler<PluginConfig extends CommonConfig> = (args: {
  context: IRContext;
  plugin: Omit<
    PluginConfig,
    '_dependencies' | '_handler' | '_handlerLegacy' | '_optionalDependencies'
  > &
    Pick<Required<PluginConfig>, 'output'>;
}) => void;

export type PluginNames =
  | '@hey-api/schemas'
  | '@hey-api/services'
  | '@hey-api/transformers'
  | '@hey-api/types'
  | '@tanstack/react-query'
  | '@tanstack/solid-query'
  | '@tanstack/svelte-query'
  | '@tanstack/vue-query'
  | 'fastify'
  | 'zod';

export interface PluginName<Name extends PluginNames> {
  name: Name;
}

interface CommonConfig {
  name: PluginNames;
  output?: string;
}

interface PluginDependencies {
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

export type DefaultPluginConfigsMap<T> = {
  [K in PluginNames]: CommonConfig &
    PluginDependencies & {
      _handler: PluginHandler<Required<Extract<T, { name: K }>>>;
      _handlerLegacy: PluginLegacyHandler<Required<Extract<T, { name: K }>>>;
    };
};

export type PluginConfig<Config extends CommonConfig> = Config &
  PluginDependencies & {
    _handler: PluginHandler<Config>;
    _handlerLegacy: PluginLegacyHandler<Config>;
  };

export type UserConfig<Config extends CommonConfig> = Omit<Config, 'output'>;

export type DefineConfig<Config extends CommonConfig> = (
  config?: UserConfig<Config>,
) => PluginConfig<Config>;
