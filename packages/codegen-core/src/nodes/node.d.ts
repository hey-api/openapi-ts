import type { File } from '../files/file';
import type { Language } from '../languages/types';
import type { IAnalysisContext } from '../planner/types';
import type { Symbol } from '../symbols/symbol';

export interface INode<T = unknown> {
  /** Perform semantic analysis. */
  analyze(ctx: IAnalysisContext): void;
  /** Whether this node is exported from its file. */
  exported?: boolean;
  /** The file this node belongs to. */
  file?: File;
  /** The programming language associated with this node */
  language: Language;
  /** Parent node in the syntax tree. */
  parent?: INode;
  /** Root node of the syntax tree. */
  root?: INode;
  /** The symbol associated with this node. */
  symbol?: Symbol;
  /** Convert this node into AST representation. */
  toAst(): T;
  /** Brand used for renderer dispatch. */
  readonly '~brand': string;
}
