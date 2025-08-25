import path from 'node:path';

import type { Package } from '../config/utils/package';
import { packageFactory } from '../config/utils/package';
import { GeneratedFile } from '../generate/file';
import type { PluginConfigMap } from '../plugins/config';
import { PluginInstance } from '../plugins/shared/utils/instance';
import type { PluginNames } from '../plugins/types';
import type { StringCase } from '../types/case';
import type { Config } from '../types/config';
import type { Files } from '../types/utils';
import type { Logger } from '../utils/logger';
import { resolveRef } from '../utils/ref';
import type { IR } from './types';

export interface ContextFile {
  /**
   * Define casing for identifiers in this file.
   */
  case?: StringCase;
  /**
   * Should the exports from this file be re-exported in the index barrel file?
   */
  exportFromIndex?: boolean;
  /**
   * Unique file identifier.
   */
  id: string;
  /**
   * Relative file path to the output path.
   *
   * @example
   * 'bar/foo.ts'
   */
  path: string;
}

export class IRContext<Spec extends Record<string, any> = any> {
  /**
   * Configuration for parsing and generating the output. This
   * is a mix of user-provided and default values.
   */
  public config: Config;
  /**
   * A map of files that will be generated from `spec`.
   */
  public files: Files = {};
  /**
   * Intermediate representation model obtained from `spec`.
   */
  public ir: IR.Model = {};
  /** Logger instance */
  public logger: Logger;
  /**
   * The package metadata and utilities for the current context, constructed
   * from the provided dependencies. Used for managing package-related
   * information such as name, version, and dependency resolution during
   * code generation.
   */
  public package: Package;
  /**
   * A map of registered plugin instances, keyed by plugin name. Plugins are
   * registered through the `registerPlugin` method and can be accessed by
   * their configured name from the config.
   */
  public plugins: Partial<
    Record<PluginNames, PluginInstance<PluginConfigMap[keyof PluginConfigMap]>>
  > = {};
  /**
   * Resolved specification from `input`.
   */
  public spec: Spec;

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
    this.logger = logger;
    this.package = packageFactory(dependencies);
    this.spec = spec;
  }

  /**
   * Create and return a new TypeScript file. Also set the current file context
   * to the newly created file.
   */
  public createFile(file: ContextFile): GeneratedFile {
    // TODO: parser - handle attempt to create duplicate
    const outputParts = file.path.split('/');
    const outputDir = path.resolve(
      this.config.output.path,
      ...outputParts.slice(0, outputParts.length - 1),
    );
    const createdFile = new GeneratedFile({
      case: file.case,
      dir: outputDir,
      exportFromIndex: file.exportFromIndex,
      id: file.id,
      name: `${outputParts[outputParts.length - 1]}.ts`,
    });
    this.files[file.id] = createdFile;
    return createdFile;
  }

  /**
   * Returns a resolved and dereferenced schema from `spec`.
   */
  public dereference<T>(schema: { $ref: string }) {
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
   * Returns a specific file by ID from `files`.
   */
  public file({ id }: Pick<ContextFile, 'id'>): GeneratedFile | undefined {
    return this.files[id];
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
      handler: plugin.handler,
      name: plugin.name,
      output: plugin.output!,
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
  public registerPlugins(): ReadonlyArray<PluginInstance> {
    return this.config.pluginOrder.map((name) => this.registerPlugin(name));
  }

  // TODO: parser - works the same as resolveRef, but for IR schemas.
  // for now, they map 1:1, but if they diverge (like with OpenAPI 2.0),
  // we will want to rewrite $refs at parse time, so they continue pointing
  // to the correct IR location
  public resolveIrRef<T>($ref: string) {
    return resolveRef<T>({
      $ref,
      spec: this.ir,
    });
  }

  /**
   * Returns a resolved reference from `spec`.
   */
  public resolveRef<T>($ref: string) {
    return resolveRef<T>({
      $ref,
      spec: this.spec,
    });
  }
}
