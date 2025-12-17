import type { HeyApiSdkPlugin } from '../types';
import type { Event } from './resource';
import { SdkResourceModel } from './resource';

export class SdkStructureModel {
  /** If true, generates a flat SDK without resource hierarchy. */
  private _flat: boolean;
  /** Name of the SDK. If empty, we fallback to operation tags. */
  private _name: string;
  /** Root resources mapped by their names. */
  private _roots: Map<string, SdkResourceModel> = new Map();

  constructor(
    name: string,
    options?: {
      /** If true, generates a flat SDK without resource hierarchy. */
      flat?: boolean;
    },
  ) {
    this._flat = options?.flat ?? false;
    this._name = name;
  }

  /**
   * Inserts an operation event into the structure.
   *
   * Parses the operation ID and organizes it into classes based on tags.
   */
  insert(event: Event, plugin: HeyApiSdkPlugin['Instance']): void {
    const { operation } = event;
    const roots = this._name
      ? [this._name]
      : this._flat
        ? ['']
        : operation.tags && operation.tags.length > 0
          ? operation.tags
          : ['default'];

    for (const name of roots) {
      const resource = this.root(name);
      resource.insert(event, plugin);
    }
  }

  /**
   * Gets or creates a root resource by name.
   *
   * If the root doesn't exist, it's created automatically.
   *
   * @param name - The name of the root resource
   * @returns The root resource instance
   */
  root(name: string): SdkResourceModel {
    if (!this._roots.has(name)) {
      this._roots.set(name, new SdkResourceModel(name));
    }
    return this._roots.get(name)!;
  }

  /**
   * Recursively walks the structure.
   *
   * Yields all resources in the structure.
   */
  *walk(): Generator<SdkResourceModel> {
    for (const resource of this._roots.values()) {
      yield* resource.walk();
    }
  }
}
