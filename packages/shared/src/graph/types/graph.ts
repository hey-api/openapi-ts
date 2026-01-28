import type { Scope } from '../../openApi/shared/utils/graph';

/**
 * The main graph structure for OpenAPI node analysis.
 *
 * @property nodeDependencies - For each node with at least one dependency, the set of normalized JSON Pointers it references via $ref. Nodes with no dependencies are omitted.
 * @property nodes - Map from normalized JSON Pointer to NodeInfo for every node in the spec.
 * @property reverseNodeDependencies - For each node with at least one dependent, the set of nodes that reference it via $ref. Nodes with no dependents are omitted.
 */
export type Graph = {
  /**
   * For each node with at least one dependency, the set of normalized JSON Pointers it references via $ref.
   * Nodes with no dependencies are omitted from this map.
   */
  nodeDependencies: Map<string, Set<string>>;
  /**
   * Map from normalized JSON Pointer to NodeInfo for every node in the spec.
   */
  nodes: Map<string, NodeInfo>;
  /**
   * For each node with at least one dependent, the set of nodes that reference it via $ref.
   * Nodes with no dependents are omitted from this map.
   */
  reverseNodeDependencies: Map<string, Set<string>>;
  /**
   * For each node, the set of direct $ref targets that appear anywhere inside the node's
   * subtree (the node itself and its children). This is populated during graph construction
   * and is used to compute top-level dependency relationships where $ref may be attached to
   * child pointers instead of the parent.
   */
  subtreeDependencies: Map<string, Set<string>>;
  /**
   * For each node, the set of all (transitive) normalized JSON Pointers it references via $ref anywhere in its subtree.
   * This includes both direct and indirect dependencies, making it useful for filtering, codegen, and tree-shaking.
   */
  transitiveDependencies: Map<string, Set<string>>;
};

/**
 * Information about a node in the OpenAPI graph.
 *
 * @property deprecated - Whether the node is deprecated. Optional.
 * @property key - The property name or array index in the parent, or null for root.
 * @property node - The actual object at this pointer in the spec.
 * @property parentPointer - The JSON Pointer of the parent node, or null for root.
 * @property scopes - The set of access scopes for this node, if any. Optional.
 * @property tags - The set of tags for this node, if any. Optional.
 */
export type NodeInfo = {
  /** Whether the node is deprecated. Optional. */
  deprecated?: boolean;
  /** The property name or array index in the parent, or null for root. */
  key: string | number | null;
  /** The actual object at this pointer in the spec.  */
  node: unknown;
  /** The JSON Pointer of the parent node, or null for root. */
  parentPointer: string | null;
  /** The set of access scopes for this node, if any. Optional. */
  scopes?: Set<Scope>;
  /** The set of tags for this node, if any. Optional. */
  tags?: Set<string>;
};
