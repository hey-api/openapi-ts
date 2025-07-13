import type { ValueToObject } from '../config/utils';
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
  valueToObject: ValueToObject;
}

type BaseApi = Record<string, unknown>;

type BaseConfig = {
  /**
   * Plugin name.
   */
  $name: AnyPluginName;
  /**
   * Should the exports from the plugin's file be re-exported in the index
   * barrel file?
   */
  exportFromIndex?: boolean;
  output?: string;
};

/**
 * Public Plugin API.
 */
export namespace Plugin {
  export type Config<T extends Types> = Pick<T, 'api'> & {
    config: Omit<T['config'], '$name' | 'output'>;
    /**
     * Dependency plugins will be always processed, regardless of whether user
     * explicitly defines them in their `plugins` config.
     */
    dependencies?: ReadonlyArray<AnyPluginName>;
    handler: Handler<T>;
    handlerLegacy?: LegacyHandler<T>;
    /**
     * Plugin name.
     */
    name: T['config']['$name'];
    output: NonNullable<T['config']['output']>;
    /**
     * Resolves static configuration values into their runtime equivalents. For
     * example, when `validator` is set to `true`, it figures out which plugin
     * should be used for validation.
     */
    resolveConfig?: (
      plugin: Omit<Plugin.Config<T>, 'dependencies'> & {
        dependencies: Set<AnyPluginName>;
      },
      context: PluginContext,
    ) => void;
    /**
     * Optional tags can be used to help with deciding plugin order and resolving
     * plugin configuration options.
     */
    tags?: ReadonlyArray<PluginTag>;
  };

  export type ConfigWithName<T extends Types> = Omit<Config<T>, 'config'> & {
    config: Omit<T['config'], 'output'>;
  };

  /** @deprecated use `definePluginConfig()` instead */
  export type DefineConfig<
    Config extends BaseConfig,
    ResolvedConfig extends BaseConfig = Config,
  > = (config?: UserConfig<Omit<Config, '$name'>>) => Omit<
    Plugin.Config<Config, ResolvedConfig>,
    '$name'
  > & {
    /**
     * Cast name to `any` so it doesn't throw type error in `plugins` array.
     * We could allow any `string` as plugin `name` in the object syntax, but
     * that TypeScript trick would cause all string methods to appear as
     * suggested auto completions, which is undesirable.
     */
    $name: any;
  };

  export interface Name<Name extends PluginNames> {
    /**
     * Plugin name.
     */
    $name: Name;
  }

  export type Types<
    Config extends BaseConfig = BaseConfig,
    ResolvedConfig extends BaseConfig = Config,
    Api extends BaseApi = never,
  > = ([Api] extends [never] ? { api?: BaseApi } : { api: Api }) & {
    config: Config;
    resolvedConfig: ResolvedConfig;
  };

  /**
   * Users cannot modify output file path to avoid risk of conflicts.
   */
  export type UserConfig<Config extends BaseConfig> = Omit<Config, 'output'>;
}

export type DefinePlugin<
  Config extends BaseConfig = BaseConfig,
  ResolvedConfig extends BaseConfig = Config,
  Api extends BaseApi = never,
> = {
  Config: Plugin.Config<Plugin.Types<Config, ResolvedConfig, Api>>;
  Handler: (args: {
    plugin: PluginInstance<Plugin.Types<Config, ResolvedConfig, Api>>;
  }) => void;
  Instance: PluginInstance<Plugin.Types<Config, ResolvedConfig, Api>>;
  /**
   * Plugin implementation for legacy parser.
   *
   * @deprecated
   */
  LegacyHandler: (args: {
    client: LegacyClient;
    files: Files;
    openApi: LegacyOpenApi;
    plugin: PluginInstance<Plugin.Types<Config, ResolvedConfig, Api>>;
  }) => void;
  Types: Plugin.Types<Config, ResolvedConfig, Api>;
};
