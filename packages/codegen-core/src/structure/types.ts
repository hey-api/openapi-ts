import type { INode } from '../nodes/node';
import type { StructureNode } from './node';

export interface StructureInsert {
  /** Inserted data. */
  data: unknown;
  /** Locations where the data should be inserted. */
  locations: ReadonlyArray<StructureLocation>;
  /** Source of the inserted data. */
  source: symbol;
}

export interface StructureItem extends Pick<StructureInsert, 'data' | 'source'> {
  /** Location of this item within the structure. */
  location: ReadonlyArray<string>;
}

export interface StructureLocation {
  /** Path within the structure where the data should be inserted. */
  path: ReadonlyArray<string>;
  /** Shell to apply at this location. */
  shell?: StructureShell;
}

export interface StructureShell {
  define: (node: StructureNode) => StructureShellResult;
}

export interface StructureShellResult {
  dependencies?: Array<INode>;
  node: INode;
}
