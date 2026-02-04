import type { File } from '../files/file';
import type { Language } from '../languages/types';
import type { IAnalysisContext } from '../planner/types';
import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';

export type MaybeRef<T> = T | Ref<T>;

export type NodeName = MaybeRef<Symbol | string | number>;

export type NodeNameSanitizer = (name: string) => string;

export type NodeRelationship = 'container' | 'reference';

export type NodeScope = 'type' | 'value';

export interface INode<T = unknown> {
  /** Perform semantic analysis. */
  analyze(ctx: IAnalysisContext): void;
  /** Create a shallow copy of this node. */
  clone(): this;
  /** Whether this node is exported from its file. */
  exported?: boolean;
  /** The file this node belongs to. */
  file?: File;
  /** The programming language associated with this node */
  language: Language;
  /** The display name of this node. */
  readonly name: Ref<NodeName> & {
    set(value: NodeName): void;
    toString(): string;
  };
  /** Optional function to sanitize the node name. */
  readonly nameSanitizer?: NodeNameSanitizer;
  /** Whether this node is a root node in the file. */
  root?: boolean;
  /** The scope of this node. */
  scope?: NodeScope;
  /** Semantic children in the structure hierarchy. */
  structuralChildren?: Map<INode, NodeRelationship>;
  /** Semantic parents in the structure hierarchy. */
  structuralParents?: Map<INode, NodeRelationship>;
  /** The symbol associated with this node. */
  symbol?: Symbol;
  /** Convert this node into AST representation. */
  toAst(): T;
  /** Brand used for renderer dispatch. */
  readonly '~brand': string;
}
