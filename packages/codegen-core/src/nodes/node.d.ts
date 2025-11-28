import type { IAnalysisContext } from '../symbols/analyzer';
import type { Symbol } from '../symbols/symbol';

export interface INode {
  /** Perform semantic analysis. */
  analyze(ctx: IAnalysisContext): void;
  /** Parent node in the constructed syntax tree. */
  parent?: INode;
  /** The symbol associated with this node, if it defines a top‑level symbol. */
  symbol?: Symbol;
  /** Brand used for renderer dispatch. */
  readonly '~brand': symbol;
}
