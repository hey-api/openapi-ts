import { normalizeJsonPointer, pathToJsonPointer } from '../../../utils/ref';
import { childSchemaRelationships } from './schemaChildRelationships';

/**
 * Represents the possible access scopes for OpenAPI nodes.
 * - 'normal': Default scope for regular nodes.
 * - 'read': Node is read-only (e.g., readOnly: true).
 * - 'write': Node is write-only (e.g., writeOnly: true).
 */
export type Scope = 'normal' | 'read' | 'write';

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
type NodeInfo = {
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

/**
 * The main graph structure for OpenAPI node analysis.
 *
 * @property dependencies - For each node, the set of normalized JSON Pointers it references via $ref.
 * @property nodes - Map from normalized JSON Pointer to NodeInfo for every node in the spec.
 * @property reverseDependencies - For each node, the set of nodes that reference it via $ref.
 */
export type Graph = {
  /**
   * For each node, the set of all (transitive) normalized JSON Pointers it references via $ref anywhere in its subtree.
   * This includes both direct and indirect dependencies, making it useful for filtering, codegen, and tree-shaking.
   */
  allDependencies: Map<string, Set<string>>;
  /** For each node, the set of normalized JSON Pointers it references via $ref. */
  dependencies: Map<string, Set<string>>;
  /** Map from normalized JSON Pointer to NodeInfo for every node in the spec. */
  nodes: Map<string, NodeInfo>;
  /** For each node, the set of nodes that reference it via $ref. */
  reverseDependencies: Map<string, Set<string>>;
};

/**
 * Ensures every relevant child node (e.g., properties, items) in the graph has a `scopes` property.
 * If a node does not have its own scopes, it inherits from its parent if available.
 *
 * @param nodes - Map of JSON Pointer to NodeInfo.
 */
export const annotateChildScopes = (nodes: Graph['nodes']): void => {
  for (const [, nodeInfo] of nodes) {
    if (nodeInfo.scopes) continue;

    if (nodeInfo.parentPointer) {
      const parentInfo = nodes.get(nodeInfo.parentPointer);
      if (parentInfo?.scopes) {
        nodeInfo.scopes = new Set(parentInfo.scopes);
      }
    }
  }
};

/**
 * Recursively collects all $ref dependencies in the subtree rooted at `pointer`.
 */
const collectAllDependenciesForPointer = ({
  graph,
  pointer,
  visited,
}: {
  graph: Graph;
  pointer: string;
  visited: Set<string>;
}): Set<string> => {
  if (visited.has(pointer)) {
    return new Set();
  }

  visited.add(pointer);

  const nodeInfo = graph.nodes.get(pointer);
  if (!nodeInfo) {
    return new Set();
  }

  const allDependencies = new Set<string>();

  // Add direct $ref dependencies for this node
  // (from the dependencies map, or by checking nodeInfo.node directly)
  // We'll use the dependencies map for consistency:
  const dependencies = graph.dependencies.get(pointer);
  if (dependencies) {
    for (const depPointer of dependencies) {
      allDependencies.add(depPointer);
      // Recursively collect dependencies of the referenced node
      const transitiveDependencies = collectAllDependenciesForPointer({
        graph,
        pointer: depPointer,
        visited,
      });
      for (const dep of transitiveDependencies) {
        allDependencies.add(dep);
      }
    }
  }

  // Recursively collect dependencies of all children
  for (const [childPointer, childInfo] of graph.nodes) {
    if (childInfo.parentPointer === pointer) {
      const transitiveDependencies = collectAllDependenciesForPointer({
        graph,
        pointer: childPointer,
        visited,
      });
      for (const dep of transitiveDependencies) {
        allDependencies.add(dep);
      }
    }
  }

  return allDependencies;
};

/**
 * Propagates scopes through the graph using a worklist algorithm.
 * Each node's scopes will be updated to include any scopes inherited via $ref dependencies, combinator/child relationships, and parent relationships.
 * Handles cycles and deep chains efficiently.
 *
 * Whenever a node's scopes change, all dependents are notified:
 *   - Its parent (if any)
 *   - All nodes that reference it via $ref (reverse dependencies)
 *   - Combinator parents (allOf/anyOf/oneOf) if applicable
 *
 * @param graph - The Graph structure containing nodes, dependencies, and reverseDependencies.
 */
export const propagateScopes = (graph: Graph): void => {
  const worklist: Set<string> = new Set(
    Array.from(graph.nodes.entries())
      .filter(([, nodeInfo]) => nodeInfo.scopes && nodeInfo.scopes.size > 0)
      .map(([pointer]) => pointer),
  );

  /**
   * Notifies all dependents of a node that its scopes may have changed.
   * Dependents include:
   *   - The parent node (if any)
   *   - All nodes that reference this node via $ref (reverse dependencies)
   *   - Combinator parents (allOf/anyOf/oneOf) if this node is a combinator child
   *
   * @param pointer - The JSON pointer of the node whose dependents to notify
   * @param nodeInfo - The NodeInfo of the node
   * @param childPointer - (Optional) The pointer of the child, used to detect combinator parents
   */
  const notifyAllDependents = (
    pointer: string,
    nodeInfo: NodeInfo,
    childPointer?: string,
  ) => {
    if (nodeInfo.parentPointer) {
      worklist.add(nodeInfo.parentPointer);
    }
    const reverseDependencies = graph.reverseDependencies.get(pointer);
    if (reverseDependencies) {
      for (const dependentPointer of reverseDependencies) {
        worklist.add(dependentPointer);
      }
    }
    if (childPointer) {
      // If this is a combinator child, notify the combinator parent
      const combinatorChildMatch = childPointer.match(
        /(.*)\/(allOf|anyOf|oneOf)\/\d+$/,
      );
      if (combinatorChildMatch) {
        const combinatorParentPointer = combinatorChildMatch[1];
        if (combinatorParentPointer) {
          worklist.add(combinatorParentPointer);
        }
      }
    }
  };

  /**
   * Propagates scopes from a child node to its parent node.
   * If the parent's scopes change, notifies all dependents.
   *
   * @param pointer - The parent node's pointer
   * @param nodeInfo - The parent node's NodeInfo
   * @param childPointer - The child node's pointer
   */
  const propagateChildScopes = (
    pointer: string,
    nodeInfo: NodeInfo,
    childPointer: string,
  ): void => {
    if (!nodeInfo?.scopes) return;
    const childInfo = graph.nodes.get(childPointer);
    if (!childInfo?.scopes) return;
    const changed = propagateScopesToNode(childInfo, nodeInfo);
    if (changed) {
      notifyAllDependents(pointer, nodeInfo, childPointer);
    }
  };

  while (worklist.size > 0) {
    const pointer = worklist.values().next().value!;
    worklist.delete(pointer);

    const nodeInfo = graph.nodes.get(pointer);
    if (!nodeInfo) continue;

    if (!nodeInfo.scopes) {
      nodeInfo.scopes = new Set();
    }

    const node = nodeInfo.node as Record<string, unknown>;

    // Propagate scopes from all child schema relationships (combinators, properties, etc.)
    for (const [keyword, type] of childSchemaRelationships) {
      if (!node || typeof node !== 'object' || !(keyword in node)) continue;
      const value = node[keyword];
      if (type === 'array' && value instanceof Array) {
        for (let index = 0; index < value.length; index++) {
          const childPointer = `${pointer}/${keyword}/${index}`;
          propagateChildScopes(pointer, nodeInfo, childPointer);
        }
      } else if (
        type === 'objectMap' &&
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Array)
      ) {
        for (const key of Object.keys(value)) {
          const childPointer = `${pointer}/${keyword}/${key}`;
          propagateChildScopes(pointer, nodeInfo, childPointer);
        }
      } else if (
        type === 'single' &&
        typeof value === 'object' &&
        value !== null
      ) {
        const childPointer = `${pointer}/${keyword}`;
        propagateChildScopes(pointer, nodeInfo, childPointer);
      } else if (type === 'singleOrArray') {
        if (value instanceof Array) {
          for (let index = 0; index < value.length; index++) {
            const childPointer = `${pointer}/${keyword}/${index}`;
            propagateChildScopes(pointer, nodeInfo, childPointer);
          }
        } else if (typeof value === 'object' && value !== null) {
          const childPointer = `${pointer}/${keyword}`;
          propagateChildScopes(pointer, nodeInfo, childPointer);
        }
      }
    }

    // Propagate scopes from $ref dependencies
    const dependencies = graph.dependencies.get(pointer);
    if (dependencies) {
      for (const depPointer of dependencies) {
        const depNode = graph.nodes.get(depPointer);
        if (depNode?.scopes) {
          const changed = propagateScopesToNode(depNode, nodeInfo);
          if (changed) {
            notifyAllDependents(pointer, nodeInfo);
          }
        }
      }
    }

    // Propagate scopes up the parent chain
    if (nodeInfo.parentPointer) {
      const parentInfo = graph.nodes.get(nodeInfo.parentPointer);
      if (parentInfo) {
        const changed = propagateScopesToNode(nodeInfo, parentInfo);
        if (changed) {
          notifyAllDependents(nodeInfo.parentPointer, parentInfo);
        }
      }
    }
  }
};

/**
 * Propagates scopes from one node to another.
 * Adds any scopes from fromNodeInfo to toNodeInfo that are not already present.
 * Returns true if any scopes were added, false otherwise.
 *
 * @param fromNodeInfo - The node to propagate scopes from
 * @param toNodeInfo - The node to propagate scopes to
 * @returns boolean - Whether any scopes were added
 */
const propagateScopesToNode = (
  fromNodeInfo: NodeInfo,
  toNodeInfo: NodeInfo,
): boolean => {
  if (!fromNodeInfo.scopes) {
    return false;
  }

  if (!toNodeInfo.scopes) {
    toNodeInfo.scopes = new Set();
  }

  let changed = false;

  for (const scope of fromNodeInfo.scopes) {
    if (!toNodeInfo.scopes.has(scope)) {
      toNodeInfo.scopes.add(scope);
      changed = true;
    }
  }

  return changed;
};

/**
 * Seeds each node in the graph with its local access scope(s) based on its own properties.
 * - 'read' if readOnly: true
 * - 'write' if writeOnly: true
 * - 'normal' if node is an object property
 *
 * Only non-array objects are considered for scope seeding.
 *
 * @param nodes - Map of JSON Pointer to NodeInfo.
 */
export const seedLocalScopes = (nodes: Graph['nodes']): void => {
  for (const [pointer, nodeInfo] of nodes) {
    const { node } = nodeInfo;

    if (typeof node !== 'object' || node === null || node instanceof Array) {
      continue;
    }

    if ('readOnly' in node && node.readOnly === true) {
      nodeInfo.scopes = new Set(['read']);
    } else if ('writeOnly' in node && node.writeOnly === true) {
      nodeInfo.scopes = new Set(['write']);
    } else if (pointer.match(/\/properties\/[^/]+$/)) {
      nodeInfo.scopes = new Set(['normal']);
    }
  }
};

/**
 * Builds a graph of all nodes in an OpenAPI spec, indexed by normalized JSON Pointer,
 * and tracks all $ref dependencies and reverse dependencies between nodes.
 *
 * - All keys in the returned maps are normalized JSON Pointers (RFC 6901, always starting with '#').
 * - The `nodes` map allows fast lookup of any node and its parent/key context.
 * - The `dependencies` map records, for each node, the set of normalized pointers it references via $ref.
 * - The `reverseDependencies` map records, for each node, the set of nodes that reference it via $ref.
 * - After construction, all nodes will have their local and propagated scopes annotated.
 *
 * @param root The root object (e.g., the OpenAPI spec)
 * @returns An object with:
 *   - nodes: Map from normalized JSON Pointer string to NodeInfo
 *   - dependencies: Map from normalized JSON Pointer string to Set of referenced normalized JSON Pointers
 *   - reverseDependencies: Map from normalized JSON Pointer string to Set of referencing normalized JSON Pointers
 */
export const buildGraph = (
  root: unknown,
): {
  graph: Graph;
} => {
  const graph: Graph = {
    allDependencies: new Map(),
    dependencies: new Map(),
    nodes: new Map(),
    reverseDependencies: new Map(),
  };

  const walk = ({
    key,
    node,
    parentPointer,
    path,
  }: NodeInfo & {
    path: ReadonlyArray<string | number>;
  }) => {
    if (typeof node !== 'object' || node === null) {
      return;
    }

    const pointer = pathToJsonPointer(path);

    let deprecated: boolean | undefined;
    let tags: Set<string> | undefined;

    if (typeof node === 'object' && node !== null) {
      // Check for deprecated property
      if ('deprecated' in node && typeof node.deprecated === 'boolean') {
        deprecated = Boolean(node.deprecated);
      }
      // If this node has a $ref, record the dependency
      if ('$ref' in node && typeof node.$ref === 'string') {
        const refPointer = normalizeJsonPointer(node.$ref);
        if (!graph.dependencies.has(pointer)) {
          graph.dependencies.set(pointer, new Set());
        }
        graph.dependencies.get(pointer)!.add(refPointer);
      }
      // Check for tags property (should be an array of strings)
      if ('tags' in node && node.tags instanceof Array) {
        tags = new Set(node.tags.filter((tag) => typeof tag === 'string'));
      }
    }

    graph.nodes.set(pointer, { deprecated, key, node, parentPointer, tags });

    if (node instanceof Array) {
      node.forEach((item, index) =>
        walk({
          key: index,
          node: item,
          parentPointer: pointer,
          path: [...path, index],
        }),
      );
    } else {
      for (const [childKey, value] of Object.entries(node)) {
        walk({
          key: childKey,
          node: value,
          parentPointer: pointer,
          path: [...path, childKey],
        });
      }
    }
  };

  walk({
    key: null,
    node: root,
    parentPointer: null,
    path: [],
  });

  for (const [pointerFrom, pointers] of graph.dependencies) {
    for (const pointerTo of pointers) {
      if (!graph.reverseDependencies.has(pointerTo)) {
        graph.reverseDependencies.set(pointerTo, new Set());
      }
      graph.reverseDependencies.get(pointerTo)!.add(pointerFrom);
    }
  }

  seedLocalScopes(graph.nodes);
  propagateScopes(graph);
  annotateChildScopes(graph.nodes);

  for (const pointer of graph.nodes.keys()) {
    const allDependencies = collectAllDependenciesForPointer({
      graph,
      pointer,
      visited: new Set(),
    });
    graph.allDependencies.set(pointer, allDependencies);
  }

  return { graph };
};
