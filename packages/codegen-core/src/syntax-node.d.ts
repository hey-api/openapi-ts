import type { Symbol } from './symbols/symbol';

export interface ISyntaxNode {
  /**
   * Collect symbols referenced directly by this node into the provided accumulator.
   */
  collectSymbols(out: Set<Symbol>): void;
  /**
   * Return local names introduced by this node.
   */
  getLocalNames(): Iterable<string>;
  /**
   * Rewrite local identifiers based on a rename map.
   */
  rewriteIdentifiers(map: Map<string, string>): void;
  /**
   * Walk this node and its children with a visitor.
   */
  traverse(visitor: (node: ISyntaxNode) => void): void;
}
