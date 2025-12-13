import type { INode } from './node';

/**
 * Context passed to `.toAst()` methods.
 */
export type AstContext = {
  /**
   * Returns the canonical node for accessing the provided node.
   */
  getAccess<T extends INode>(node: T): T;
};
