import type { Symbol } from './symbols/symbol';

export interface ISyntaxNode {
  /**
   * Return local names introduced by this node.
   */
  getLocalNames(): Iterable<string>;
  /**
   * Return symbols referenced directly by this node.
   */
  getSymbols(): Iterable<Symbol>;
  /**
   * Rewrite local identifiers based on a rename map.
   */
  rewriteIdentifiers(map: Map<string, string>): void;
  /**
   * Walk this node and its children with a visitor.
   */
  traverse(visitor: (node: ISyntaxNode) => void): void;
}
