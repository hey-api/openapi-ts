import type { INode } from './node';

export interface INodeRegistry {
  /**
   * Register a syntax node.
   *
   * @returns The index of the registered node.
   */
  add(node: INode | null): number;
  /**
   * All nodes in insertion order.
   */
  all(): Iterable<INode>;
  /**
   * Remove a node by its index.
   *
   * @param index Index of the node to remove.
   */
  remove(index: number): void;
  /**
   * Update a node at the given index.
   *
   * @param index Index of the node to update.
   * @param node New node to set.
   */
  update(index: number, node: INode | null): void;
}
