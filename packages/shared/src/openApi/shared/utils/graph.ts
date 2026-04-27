import type { Logger } from '@hey-api/codegen-core';

import type { Graph, NodeInfo } from '../../../graph';
import { encodeJsonPointerSegment, normalizeJsonPointer } from '../../../utils/ref';

/**
 * Represents the possible access scopes for OpenAPI nodes.
 * - 'normal': Default scope for regular nodes.
 * - 'read': Node is read-only (e.g., readOnly: true).
 * - 'write': Node is write-only (e.g., writeOnly: true).
 */
export type Scope = 'normal' | 'read' | 'write';

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

interface Cache {
  parentToChildren: Map<string, Array<string>>;
  subtreeDependencies: Map<string, Set<string>>;
  transitiveDependencies: Map<string, Set<string>>;
}

type PointerDependenciesResult = {
  subtreeDependencies: Set<string>;
  transitiveDependencies: Set<string>;
};

/**
 * Recursively collects all $ref dependencies in the subtree rooted at `pointer`.
 */
const collectPointerDependencies = ({
  cache,
  graph,
  pointer,
  visited,
}: {
  cache: Cache;
  graph: Graph;
  pointer: string;
  visited: Set<string>;
}): PointerDependenciesResult => {
  const cached = cache.transitiveDependencies.get(pointer);
  if (cached) {
    return {
      subtreeDependencies: cache.subtreeDependencies.get(pointer)!,
      transitiveDependencies: cached,
    };
  }

  if (visited.has(pointer)) {
    return {
      subtreeDependencies: new Set(),
      transitiveDependencies: new Set(),
    };
  }
  visited.add(pointer);

  const nodeInfo = graph.nodes.get(pointer);
  if (!nodeInfo) {
    return {
      subtreeDependencies: new Set(),
      transitiveDependencies: new Set(),
    };
  }

  const transitiveDependencies = new Set<string>();
  const subtreeDependencies = new Set<string>();

  // Add direct $ref dependencies for this node
  // (from the dependencies map, or by checking nodeInfo.node directly)
  // We'll use the dependencies map for consistency:
  const nodeDependencies = graph.nodeDependencies.get(pointer);
  if (nodeDependencies) {
    for (const depPointer of nodeDependencies) {
      transitiveDependencies.add(depPointer);
      subtreeDependencies.add(depPointer);
      // Recursively collect dependencies of the referenced node
      const depResult = collectPointerDependencies({
        cache,
        graph,
        pointer: depPointer,
        visited,
      });
      for (const dependency of depResult.transitiveDependencies) {
        transitiveDependencies.add(dependency);
      }
    }
  }

  const children = cache.parentToChildren.get(pointer) ?? [];
  for (const childPointer of children) {
    let childResult: Partial<PointerDependenciesResult> = {
      subtreeDependencies: cache.subtreeDependencies.get(childPointer),
      transitiveDependencies: cache.transitiveDependencies.get(childPointer),
    };
    if (!childResult.subtreeDependencies || !childResult.transitiveDependencies) {
      childResult = collectPointerDependencies({
        cache,
        graph,
        pointer: childPointer,
        visited,
      });
      cache.transitiveDependencies.set(childPointer, childResult.transitiveDependencies!);
      cache.subtreeDependencies.set(childPointer, childResult.subtreeDependencies!);
    }
    for (const dependency of childResult.transitiveDependencies!) {
      transitiveDependencies.add(dependency);
    }
    for (const dependency of childResult.subtreeDependencies!) {
      subtreeDependencies.add(dependency);
    }
  }

  cache.transitiveDependencies.set(pointer, transitiveDependencies);
  cache.subtreeDependencies.set(pointer, subtreeDependencies);
  return {
    subtreeDependencies,
    transitiveDependencies,
  };
};

/**
 * Propagates scopes through the graph using a multi-pass linear scan.
 *
 * Nodes are visited in reverse DFS-pre-order (bottom-up): children tend to
 * appear before their parents so each node can push its scopes to its parent
 * within the same pass.  For typical OpenAPI specs (components declared after
 * paths) $ref targets also appear before $ref sources in this order, meaning
 * both tree propagation and $ref propagation usually converge in a single pass.
 *
 * The outer `while (changed)` loop guarantees correctness for any ordering:
 * it re-runs until no new scope values were added anywhere.  Because scopes
 * can only grow (at most 3 values: 'normal', 'read', 'write'), the loop
 * terminates in at most a handful of passes even for pathological specs.
 *
 * @param graph - The Graph structure containing nodes and dependencies.
 */
export const propagateScopes = (graph: Graph): void => {
  // Reverse of insertion order (DFS pre-order) ≈ bottom-up: children before parents.
  const nodesBottomUp = [...graph.nodes].reverse();

  let changed = true;
  while (changed) {
    changed = false;
    for (const [pointer, nodeInfo] of nodesBottomUp) {
      // Pull scopes from $ref dependencies into this node.
      const nodeDeps = graph.nodeDependencies.get(pointer);
      if (nodeDeps) {
        for (const depPointer of nodeDeps) {
          const depInfo = graph.nodes.get(depPointer);
          if (depInfo?.scopes && propagateScopesToNode(depInfo, nodeInfo)) {
            changed = true;
          }
        }
      }

      // Push this node's scopes up to its parent.
      if (nodeInfo.scopes && nodeInfo.parentPointer) {
        const parentInfo = graph.nodes.get(nodeInfo.parentPointer);
        if (parentInfo && propagateScopesToNode(nodeInfo, parentInfo)) {
          changed = true;
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
const propagateScopesToNode = (fromNodeInfo: NodeInfo, toNodeInfo: NodeInfo): boolean => {
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
 * Builds a graph of all nodes in an OpenAPI spec, indexed by normalized JSON Pointer,
 * and tracks all $ref dependencies and reverse dependencies between nodes.
 *
 * - All keys in the returned maps are normalized JSON Pointers (RFC 6901, always starting with '#').
 * - The `nodes` map allows fast lookup of any node and its parent/key context.
 * - The `dependencies` map records, for each node, the set of normalized pointers it references via $ref.
 * - After construction, all nodes will have their local and propagated scopes annotated.
 *
 * @param root The root object (e.g., the OpenAPI spec)
 * @returns An object with:
 *   - nodes: Map from normalized JSON Pointer string to NodeInfo
 *   - dependencies: Map from normalized JSON Pointer string to Set of referenced normalized JSON Pointers
 */
export function buildGraph(
  root: unknown,
  logger: Logger,
): {
  graph: Graph;
} {
  const eventBuildGraph = logger.timeEvent('build-graph');
  const graph: Graph = {
    nodeDependencies: new Map(),
    nodes: new Map(),
    subtreeDependencies: new Map(),
    transitiveDependencies: new Map(),
  };

  const walk = ({
    key,
    node,
    parentPointer,
    pointer,
  }: {
    key: string | number | null;
    node: unknown;
    parentPointer: string | null;
    pointer: string;
  }) => {
    if (typeof node !== 'object' || node === null) {
      return;
    }

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
        if (!graph.nodeDependencies.has(pointer)) {
          graph.nodeDependencies.set(pointer, new Set());
        }
        graph.nodeDependencies.get(pointer)!.add(refPointer);
      }
      // Check for tags property (should be an array of strings)
      if ('tags' in node && Array.isArray(node.tags)) {
        tags = new Set(node.tags.filter((tag) => typeof tag === 'string'));
      }
    }

    graph.nodes.set(pointer, { deprecated, key, node, parentPointer, tags });

    if (Array.isArray(node)) {
      node.forEach((item, index) =>
        walk({
          key: index,
          node: item,
          parentPointer: pointer,
          pointer: pointer + '/' + encodeJsonPointerSegment(index),
        }),
      );
    } else {
      for (const [childKey, value] of Object.entries(node)) {
        walk({
          key: childKey,
          node: value,
          parentPointer: pointer,
          pointer: pointer + '/' + encodeJsonPointerSegment(childKey),
        });
      }
    }
  };

  walk({
    key: null,
    node: root,
    parentPointer: null,
    pointer: '#',
  });

  const cache: Cache = {
    parentToChildren: new Map(),
    subtreeDependencies: new Map(),
    transitiveDependencies: new Map(),
  };

  // Merge parentToChildren cache build + scope seeding into one pass over graph.nodes.
  for (const [pointer, nodeInfo] of graph.nodes) {
    const parent = nodeInfo.parentPointer;
    if (parent) {
      let arr = cache.parentToChildren.get(parent);
      if (!arr) {
        arr = [];
        cache.parentToChildren.set(parent, arr);
      }
      arr.push(pointer);
    }

    // Seeds each node in the graph with its local access scope(s) based on its own properties.
    // - 'read' if readOnly: true
    // - 'write' if writeOnly: true
    // - 'normal' if node is an object property
    //
    // Only non-array objects are considered for scope seeding.
    const { node } = nodeInfo;
    if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
      if ('readOnly' in node && node.readOnly === true) {
        nodeInfo.scopes = new Set(['read']);
      } else if ('writeOnly' in node && node.writeOnly === true) {
        nodeInfo.scopes = new Set(['write']);
      } else {
        // Check /properties/{key} without a regex: compare the segment before the
        // last slash to the string 'properties'.
        const lastSlash = pointer.lastIndexOf('/');
        if (lastSlash > 0) {
          const prevSlash = pointer.lastIndexOf('/', lastSlash - 1);
          if (prevSlash >= 0 && pointer.slice(prevSlash + 1, lastSlash) === 'properties') {
            nodeInfo.scopes = new Set(['normal']);
          }
        }
      }
    }
  }

  propagateScopes(graph);
  annotateChildScopes(graph.nodes);

  for (const pointer of graph.nodes.keys()) {
    const result = collectPointerDependencies({
      cache,
      graph,
      pointer,
      visited: new Set(),
    });
    graph.transitiveDependencies.set(pointer, result.transitiveDependencies);
    graph.subtreeDependencies.set(pointer, result.subtreeDependencies);
  }

  eventBuildGraph.timeEnd();

  // functions creating data for debug scripts located in `dev/`
  // const { maxChildren, maxDepth, totalNodes } = debugTools.graph.analyzeStructure(graph);
  // const nodesForViz = debugTools.graph.exportForVisualization(graph);
  // fs.writeFileSync('dev/graph.json', JSON.stringify(nodesForViz, null, 2));

  return { graph };
}
