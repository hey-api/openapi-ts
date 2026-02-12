import { StructureNode } from './node';
import type { StructureInsert } from './types';

export class StructureModel {
  /** Root nodes mapped by their names. */
  private _roots: Map<string, StructureNode> = new Map();
  /** Node for data without a specific root. */
  private _virtualRoot?: StructureNode;

  /**
   * Get all root nodes.
   */
  get roots(): ReadonlyArray<StructureNode> {
    const roots = Array.from(this._roots.values());
    if (this._virtualRoot) roots.unshift(this._virtualRoot);
    return roots;
  }

  /**
   * Insert data into the structure.
   */
  insert(args: StructureInsert): void {
    const { data, locations, source } = args;
    for (const location of locations) {
      const { path, shell } = location;
      const fullPath = path.filter((s): s is string => Boolean(s));
      const segments = fullPath.slice(0, -1);
      const name = fullPath[fullPath.length - 1];

      if (!name) {
        throw new Error('Cannot insert data without path.');
      }

      let cursor: StructureNode | null = null;

      for (const segment of segments) {
        if (!cursor) {
          cursor = this.root(segment);
        } else {
          cursor = cursor.child(segment);
        }

        if (shell && !cursor.shell) {
          cursor.shell = shell;
          cursor.shellSource = source;
        }
      }

      if (!cursor) {
        cursor = this.root(null);
      }

      cursor.items.push({ data, location: fullPath, source });
    }
  }

  /**
   * Gets or creates a root by name.
   *
   * If the root doesn't exist, it's created automatically.
   *
   * @param name - The name of the root
   * @returns The root instance
   */
  root(name: string | null): StructureNode {
    if (!name) {
      return (this._virtualRoot ??= new StructureNode('', undefined, {
        virtual: true,
      }));
    }
    if (!this._roots.has(name)) {
      this._roots.set(name, new StructureNode(name));
    }
    return this._roots.get(name)!;
  }

  /**
   * Walk all nodes in the structure (depth-first, post-order).
   *
   * @returns Generator of all structure nodes
   */
  *walk(): Generator<StructureNode> {
    if (this._virtualRoot) {
      yield* this._virtualRoot.walk();
    }
    for (const root of this._roots.values()) {
      yield* root.walk();
    }
  }
}
