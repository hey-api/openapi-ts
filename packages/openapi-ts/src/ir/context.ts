import { Project } from '@hey-api/codegen-core';

import type { Package } from '../config/utils/package';
import { packageFactory } from '../config/utils/package';
import { TypeScriptRenderer } from '../generate/renderer';
import { buildName } from '../openApi/shared/utils/name';
import type { PluginConfigMap } from '../plugins/config';
import { PluginInstance } from '../plugins/shared/utils/instance';
import type { PluginNames } from '../plugins/types';
import type { Config } from '../types/config';
import type { Logger } from '../utils/logger';
import { resolveRef } from '../utils/ref';
import type { IR } from './types';

export class IRContext<Spec extends Record<string, any> = any> {
  /**
   * Configuration for parsing and generating the output. This
   * is a mix of user-provided and default values.
   */
  config: Config;
  /**
   * The code generation project instance used to manage files, symbols,
   */
  gen: Project;
  /**
   * Intermediate representation model obtained from `spec`.
   */
  ir: IR.Model = {};
  /**
   * Logger instance.
   */
  logger: Logger;
  /**
   * The package metadata and utilities for the current context, constructed
   * from the provided dependencies. Used for managing package-related
   * information such as name, version, and dependency resolution during
   * code generation.
   */
  package: Package;
  /**
   * A map of registered plugin instances, keyed by plugin name. Plugins are
   * registered through the `registerPlugin` method and can be accessed by
   * their configured name from the config.
   */
  plugins: Partial<
    Record<PluginNames, PluginInstance<PluginConfigMap[keyof PluginConfigMap]>>
  > = {};
  /**
   * Resolved specification from `input`.
   */
  spec: Spec;

  constructor({
    config,
    dependencies,
    logger,
    spec,
  }: {
    config: Config;
    dependencies: Record<string, string>;
    logger: Logger;
    spec: Spec;
  }) {
    this.config = config;
    this.gen = new Project({
      defaultFileName: 'index',
      fileName: (base) => {
        const name = buildName({
          config: config.output.fileName,
          name: base,
        });
        const { suffix } = config.output.fileName;
        if (!suffix) {
          return name;
        }
        return name === 'index' || name.endsWith(suffix)
          ? name
          : `${name}${suffix}`;
      },
      renderers: {
        // TODO: allow overriding via config with custom renderers
        '.ts': new TypeScriptRenderer(),
      },
      root: config.output.path,
    });
    this.logger = logger;
    this.package = packageFactory(dependencies);
    this.spec = spec;
  }

  /**
   * Returns a resolved and dereferenced schema from `spec`.
   */
  dereference<T>(schema: { $ref: string }) {
    const resolved = this.resolveRef<T>(schema.$ref);
    const dereferenced = {
      ...schema,
      ...resolved,
    } as T;
    // @ts-expect-error
    delete dereferenced.$ref;
    return dereferenced;
  }

  /**
   * Registers a new plugin to the global context.
   *
   * @param name Plugin name.
   * @returns Registered plugin instance.
   */
  private registerPlugin<T extends PluginNames>(
    name: T,
  ): PluginInstance<PluginConfigMap[T]> {
    const plugin = this.config.plugins[name]!;
    const instance = new PluginInstance({
      api: plugin.api,
      config: plugin.config as any,
      context: this as any,
      dependencies: plugin.dependencies ?? [],
      gen: this.gen,
      handler: plugin.handler,
      name: plugin.name,
      output: plugin.output as string,
    });
    this.plugins[instance.name] = instance;
    return instance;
  }

  /**
   * Registers all plugins in the order specified by the configuration and returns
   * an array of the registered PluginInstance objects. Each plugin is instantiated
   * and added to the context's plugins map.
   *
   * @returns {ReadonlyArray<PluginInstance>} An array of registered plugin instances in order.
   */
  registerPlugins(): ReadonlyArray<PluginInstance> {
    return this.config.pluginOrder.map((name) => this.registerPlugin(name));
  }

  // TODO: parser - works the same as resolveRef, but for IR schemas.
  // for now, they map 1:1, but if they diverge (like with OpenAPI 2.0),
  // we will want to rewrite $refs at parse time, so they continue pointing
  // to the correct IR location
  resolveIrRef<T>($ref: string) {
    return resolveRef<T>({
      $ref,
      spec: this.ir,
    });
  }

  /**
   * Returns a resolved reference from `spec`.
   */
  resolveRef<T>($ref: string) {
    return resolveRef<T>({
      $ref,
      spec: this.spec,
    });
  }
}
