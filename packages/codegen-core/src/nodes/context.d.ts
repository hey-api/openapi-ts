import type { Symbol } from '../symbols/symbol';
import type { AccessPatternOptions, INode } from './node';

/**
 * Context passed to `.toAst()` methods.
 */
export interface AstContext {
  /**
   * Returns the canonical node for accessing the provided node.
   */
  getAccess<T = unknown>(
    node: INode | Symbol,
    options?: AccessPatternOptions,
  ): T;
}
