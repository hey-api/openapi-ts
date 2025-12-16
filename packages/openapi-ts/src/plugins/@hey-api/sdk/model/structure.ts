import type { IR } from '~/ir/types';

import type { HeyApiSdkPlugin } from '../types';
import { SdkClassModel } from './class';

export class SdkStructureModel {
  /** Name of the SDK. If empty, we fallback to operation tags. */
  private _name: string;

  /** Root classes mapped by their names. */
  roots: Map<string, SdkClassModel> = new Map();

  constructor(name: string) {
    this._name = name;
  }

  /**
   * Inserts an operation into the structure.
   *
   * Parses the operation ID and organizes it into classes based on tags.
   */
  insert(
    operation: IR.OperationObject,
    plugin: HeyApiSdkPlugin['Instance'],
  ): void {
    const roots = this._name ? [this._name] : (operation.tags ?? ['default']);

    for (const name of roots) {
      const model = this.root(name);
      model.insert(operation, plugin);
    }
  }

  /**
   * Gets or creates a root class by name.
   *
   * If the root doesn't exist, it's created automatically.
   *
   * @param name - The name of the root class
   * @returns The root class instance
   */
  root(name: string): SdkClassModel {
    if (!this.roots.has(name)) {
      this.roots.set(name, new SdkClassModel(name));
    }
    return this.roots.get(name)!;
  }

  /**
   * Recursively walks the structure.
   *
   * Yields all classes in the structure.
   */
  *walk(): Generator<SdkClassModel> {
    for (const model of this.roots.values()) {
      yield* model.walk();
    }
  }
}
