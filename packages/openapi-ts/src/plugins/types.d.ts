import type { ValueToObject } from '~/config/utils/config';
import type { Package } from '~/config/utils/package';
import type { Hooks } from '~/parser/types/hooks';
import type { PluginInstance } from '~/plugins/shared/utils/instance';

export type PluginClientNames =
  | '@hey-api/client-angular'
  | '@hey-api/client-axios'
  | '@hey-api/client-fetch'
  | '@hey-api/client-ky'
  | '@hey-api/client-next'
  | '@hey-api/client-nuxt'
  | '@hey-api/client-ofetch';

export type PluginValidatorNames = 'arktype' | 'valibot' | 'zod';

export type PluginNames =
  | PluginClientNames
  | '@angular/common'
  | '@hey-api/schemas'
  | '@hey-api/sdk'
  | '@hey-api/transformers'
  | '@hey-api/typescript'
  | '@pinia/colada'
  | '@tanstack/angular-query-experimental'
  | '@tanstack/react-query'
  | '@tanstack/solid-query'
  | '@tanstack/svelte-query'
  | '@tanstack/vue-query'
  | 'fastify'
  | 'swr'
  | PluginValidatorNames;

export type AnyPluginName = PluginNames | (string & {});

type PluginTag = 'client' | 'sdk' | 'transformer' | 'validator';

export type PluginContext = {
  package: Package;
  pluginByTag: <T extends AnyPluginName | boolean = AnyPluginName>(
    tag: PluginTag,
    props?: {
      defaultPlugin?: Exclude<T, boolean>;
      errorMessage?: string;
    },
  ) => Exclude<T, boolean> | undefined;
  valueToObject: ValueToObject;
};

type BaseApi = Record<string, unknown>;

type BaseConfig = {
  /**
   * Should the exports from the plugin's file be re-exported in the index
   * barrel file?
   */
  exportFromIndex?: boolean;
  name: AnyPluginName;
  /**
   * Optional hooks to override default plugin behavior.
   *
   * Use these to classify resources, control which outputs are generated,
   * or provide custom behavior for specific resources.
   */
  '~hooks'?: Hooks;
};

/**
 * Public Plugin API.
 */
export namespace Plugin {
  export type Config<T extends Types> = Pick<T, 'api'> & {
    config: Omit<T['config'], 'name'>;
    /**
     * Dependency plugins will be always processed, regardless of whether user
     * explicitly defines them in their `plugins` config.
     */
    dependencies?: ReadonlyArray<AnyPluginName>;
    handler: Handler<T>;
    name: T['config']['name'];
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
     * Tags can be used to help with deciding plugin order and resolving
     * plugin configuration options.
     */
    tags?: ReadonlyArray<PluginTag>;
  };

  /**
   * Generic wrapper for plugin hooks.
   */
  export type Hooks = Pick<BaseConfig, '~hooks'>;

  export interface Name<Name extends PluginNames> {
    name: Name;
  }

  export type Types<
    Config extends BaseConfig = BaseConfig,
    ResolvedConfig extends BaseConfig = Config,
    Api extends BaseApi = never,
  > = ([Api] extends [never] ? { api?: BaseApi } : { api: Api }) & {
    config: Config;
    resolvedConfig: ResolvedConfig;
  };
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
  Types: Plugin.Types<Config, ResolvedConfig, Api>;
};
