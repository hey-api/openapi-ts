import type { File } from '../files/file';
import type { Language } from '../languages/types';
import type { IAnalysisContext } from '../planner/types';
import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';
import type { AstContext } from './context';

export type AccessContext = 'docs' | 'runtime';

export interface AccessPatternContext<Node extends INode = INode> {
  /** The full chain. */
  chain: ReadonlyArray<Node>;
  /** Position in the chain (0 = root). */
  index: number;
  /** Is this the leaf node? */
  isLeaf: boolean;
  /** Is this the root node? */
  isRoot: boolean;
  /** Total length of the chain. */
  length: number;
}

export interface AccessPatternOptions {
  /** The access context. */
  context: AccessContext;
}

export type MaybeRef<T> = T | Ref<T>;

export type NodeName = MaybeRef<Symbol | string | number>;

export type NodeNameSanitizer = (name: string) => string;

export type NodeRole =
  | 'accessor'
  | 'container'
  | 'control-flow'
  | 'expression'
  | 'literal';

export type NodeScope = 'type' | 'value';

export type StructuralRelationship = 'container' | 'reference';

export interface INode<T = unknown> {
  /** Custom access pattern for this node. */
  accessPattern?(
    node: this,
    options: AccessPatternOptions,
    ctx: AccessPatternContext<this>,
  ): unknown | undefined;
  /** Perform semantic analysis. */
  analyze(ctx: IAnalysisContext): void;
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
  /** The role of this node within the structure. */
  role?: NodeRole;
  /** Whether this node is a root node in the file. */
  root?: boolean;
  /** The scope of this node. */
  scope?: NodeScope;
  /** Semantic children in the structure hierarchy. */
  structuralChildren?: Map<INode, StructuralRelationship>;
  /** Semantic parents in the structure hierarchy. */
  structuralParents?: Map<INode, StructuralRelationship>;
  /** The symbol associated with this node. */
  symbol?: Symbol;
  /** Convert this node into AST representation. */
  toAst(ctx: AstContext): T;
  /** Brand used for renderer dispatch. */
  readonly '~brand': string;
}
