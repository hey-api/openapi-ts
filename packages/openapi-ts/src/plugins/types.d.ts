import type { OpenApi as LegacyOpenApi } from '../openApi';
import type { Client as LegacyClient } from '../types/client';
import type { Files } from '../types/utils';
import type { PluginInstance } from './shared/utils/instance';

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
  pluginByTag: <T extends AnyPluginName | boolean = AnyPluginName>(
    tag: PluginTag,
    props?: {
      defaultPlugin?: Exclude<T, boolean>;
      errorMessage?: string;
    },
  ) => Exclude<T, boolean> | undefined;
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
  dependencies?: ReadonlyArray<AnyPluginName>;
  /**
   * Resolves static configuration values into their runtime equivalents. For
   * example, when `validator` is set to `true`, it figures out which plugin
   * should be used for validation.
   */
  resolveConfig?: (
    config: Omit<Plugin.Config<Config>, 'dependencies'> & {
      dependencies: Set<AnyPluginName>;
    },
    context: PluginContext,
  ) => void;
  /**
   * Optional tags can be used to help with deciding plugin order and resolving
   * plugin configuration options.
   */
  tags?: ReadonlyArray<PluginTag>;
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
      config: Omit<Config, 'name' | 'output'>;
      handler: Plugin.Handler<
        Omit<Config, 'name'> & {
          name: any;
        }
      >;
      handlerLegacy: Plugin.LegacyHandler<
        Omit<Config, 'name'> & {
          name: any;
        }
      >;
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
    plugin: Plugin.Instance<Config>;
  }) => ReturnType;

  export type Instance<Config extends BaseConfig> = PluginInstance<Config>;

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
