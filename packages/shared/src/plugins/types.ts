/* eslint-disable @typescript-eslint/no-namespace */
import type { Symbol } from '@hey-api/codegen-core';
import type { AnyString } from '@hey-api/types';

import type {
  CommentsOption,
  IndexExportOption,
  UserCommentsOption,
  UserIndexExportOption,
} from '../config/shared';
import type { ValueToObject } from '../config/utils/config';
import type { Dependency } from '../config/utils/dependencies';
import type { Hooks as ParserHooks } from '../parser/hooks';
import type { NormalizerTable } from './shared/utils/config';
import type { PluginInstance } from './shared/utils/instance';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginConfigMap {}

export type PluginNames = keyof PluginConfigMap extends never ? string : keyof PluginConfigMap;

export type AnyPluginName = PluginNames | AnyString;

export type PluginTag = 'client' | 'mocker' | 'sdk' | 'transformer' | 'validator';

export type PluginContext = {
  package: Dependency;
  pluginByTag: <T extends AnyPluginName | boolean = AnyPluginName>(
    tag: PluginTag,
    props?: {
      defaultPlugin?: Exclude<T, boolean>;
      errorMessage?: string;
    },
  ) => Exclude<T, boolean> | undefined;
  valueToObject: ValueToObject;
};

export type PluginSymbols = {
  [key: string]: Symbol | PluginSymbols;
};

type BaseApi = Record<string, unknown>;

type PluginBaseConfig = UserIndexExportOption & {
  name: AnyPluginName;
  /**
   * Optional hooks to override default plugin behavior.
   *
   * Use these to classify resources, control which outputs are generated,
   * or provide custom behavior for specific resources.
   */
  '~hooks'?: ParserHooks;
};

/** Public Plugin API. */
export namespace Plugin {
  export type Config<T extends Types> = Pick<T, 'api'> & {
    config:
      | NormalizerTable<T['resolvedConfig'], Omit<T['config'], 'name'>>
      | ((
          config: Omit<T['config'], 'name'>,
          context: { valueToObject: ValueToObject },
        ) => NormalizerTable<T['resolvedConfig'], Omit<T['config'], 'name'>>);
    /**
     * Dependency plugins will be always processed, regardless of whether user
     * explicitly defines them in their `plugins` config.
     */
    dependencies?: ReadonlyArray<AnyPluginName>;
    handler: (args: { plugin: PluginInstance<T> }) => void;
    name: T['config']['name'];
    /**
     * Resolves static configuration values into their runtime equivalents. For
     * example, when `validator` is set to `true`, it figures out which plugin
     * should be used for validation.
     */
    resolveConfig?: (plugin: Plugin.Stored<T>, context: PluginContext) => void;
    /**
     * Symbols this plugin registers at construction time.
     */
    symbols?: (plugin: PluginInstance<T>) => T['symbols'];
    /**
     * Tags can be used to help with deciding plugin order and resolving
     * plugin configuration options.
     */
    tags?: ReadonlyArray<PluginTag>;
  };

  export type Comments = CommentsOption;
  export type UserComments = UserCommentsOption;

  export type Exports = IndexExportOption;
  export type UserExports = UserIndexExportOption;

  /** Generic wrapper for plugin hooks. */
  export type Hooks = Pick<PluginBaseConfig, '~hooks'>;

  export interface Name<Name extends PluginNames> {
    name: Name;
  }

  /**
   * Generic wrapper for plugin resolvers.
   *
   * Provides a namespaced configuration entry (`~resolvers`)
   * where plugins can define how specific schema constructs
   * should be resolved or overridden.
   */
  export type Resolvers<T extends Record<string, unknown> = Record<string, unknown>> = {
    /**
     * Custom behavior resolvers for a plugin.
     *
     * Used to define how specific schema constructs are
     * resolved into AST or runtime logic.
     */
    '~resolvers'?: T;
  };

  export interface ResolverNodes<T> {
    /** Nodes used to build different parts of the result. */
    nodes: T;
  }

  /** Resolved plugin shape stored in Config['plugins'] after processing. */
  export type Stored<T extends Types> = Omit<Plugin.Config<T>, 'config' | 'dependencies'> & {
    config: T['resolvedConfig'];
    dependencies: Set<AnyPluginName>;
  };

  export type Types<
    Config extends PluginBaseConfig = PluginBaseConfig,
    ResolvedConfig extends PluginBaseConfig = Config,
    Api extends BaseApi = never,
    Symbols extends PluginSymbols = Record<never, never>,
  > = ([Api] extends [never] ? { api?: BaseApi } : { api: Api }) & {
    config: Config;
    resolvedConfig: ResolvedConfig;
    symbols: Symbols;
  };
}

export type DefinePlugin<
  Config extends PluginBaseConfig = PluginBaseConfig,
  ResolvedConfig extends PluginBaseConfig = Config,
  Api extends BaseApi = never,
  Symbols extends PluginSymbols = Record<never, never>,
> = {
  Config: Plugin.Config<Plugin.Types<Config, ResolvedConfig, Api, Symbols>>;
  Handler: (args: {
    plugin: PluginInstance<Plugin.Types<Config, ResolvedConfig, Api, Symbols>>;
  }) => void;
  /** The plugin instance. */
  Instance: PluginInstance<Plugin.Types<Config, ResolvedConfig, Api, Symbols>>;
  Types: Plugin.Types<Config, ResolvedConfig, Api, Symbols>;
};
