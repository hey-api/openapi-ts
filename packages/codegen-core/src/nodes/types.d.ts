import type { INode } from './node';

export interface INodeRegistry {
  /**
   * Register a syntax node.
   */
  add(node: INode): void;
  /**
   * All nodes in insertion order.
   */
  all(): ReadonlyArray<INode>;
  /**
   * Nodes by backend brand, so planner doesn't need to filter repeatedly.
   */
  byBrand(brand: symbol): ReadonlyArray<INode>;
}
