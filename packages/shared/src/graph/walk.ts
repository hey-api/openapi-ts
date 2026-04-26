import { MinHeap } from '../utils/minHeap';
import type { GetPointerPriorityFn, WalkFn } from './types/walk';

/**
 * Walk the nodes of the graph in declaration (insertion) order.
 * This is a cheap alternative to `walkTopological` when dependency ordering
 * is not required and the caller only wants nodes in the order they were
 * added to the graph.
 */
const walkDeclarations: WalkFn = (graph, callback, options) => {
  if (options?.preferGroups && options.preferGroups.length) {
    // Single pass: bucket each pointer into its group (or unmatched).
    // This avoids re-scanning all pointers K times (once per preferred group).
    const buckets = new Map<string, string[]>();
    for (const kind of options.preferGroups) {
      if (!buckets.has(kind)) {
        buckets.set(kind, []);
      }
    }
    const unmatched: string[] = [];

    for (const pointer of graph.nodes.keys()) {
      if (options.matchPointerToGroup) {
        const result = options.matchPointerToGroup(pointer);
        if (result.matched) {
          const bucket = buckets.get(result.kind);
          // kind not in preferGroups → treat as unmatched
          (bucket ?? unmatched).push(pointer);
          continue;
        }
      }
      unmatched.push(pointer);
    }

    // emit in group order, then unmatched in declaration order
    const emittedGroups = new Set<string>();
    for (const kind of options.preferGroups) {
      if (emittedGroups.has(kind)) continue;
      emittedGroups.add(kind);
      for (const pointer of buckets.get(kind)!) {
        callback(pointer, graph.nodes.get(pointer)!);
      }
    }
    for (const pointer of unmatched) {
      callback(pointer, graph.nodes.get(pointer)!);
    }
    return;
  }

  // fallback: simple declaration order, no need to materialise an array
  for (const [pointer, node] of graph.nodes) {
    callback(pointer, node);
  }
};

/**
 * Walks the nodes of the graph in topological order (dependencies before dependents).
 * Calls the callback for each node pointer in order.
 * Nodes in cycles are grouped together and emitted in arbitrary order within the group.
 *
 * @param graph - The dependency graph
 * @param callback - Function to call for each node pointer
 */
const walkTopological: WalkFn = (graph, callback, options) => {
  // stable Kahn's algorithm that respects declaration order as a tiebreaker.
  const pointers = Array.from(graph.nodes.keys());

  // composite decl index: group priority then base insertion order
  const declIndex = new Map<string, number>();

  // dependency sets, in-degree, reverse adjacency, and initial heap — all
  // built in a single pass over pointers to avoid repeated iteration.
  const depsOf = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, Set<string>>();
  const heap = new MinHeap(declIndex);

  pointers.forEach((pointer, index) => {
    const priority = options?.getPointerPriority?.(pointer) ?? 10;
    declIndex.set(pointer, priority * 1_000_000 + index);

    const raw = graph.subtreeDependencies?.get(pointer) ?? new Set();
    const deps = new Set<string>();
    for (const rawPointer of raw) {
      if (rawPointer === pointer) continue; // ignore self-dependencies for ordering
      if (graph.nodes.has(rawPointer)) deps.add(rawPointer);
    }
    depsOf.set(pointer, deps);
    inDegree.set(pointer, deps.size);

    for (const d of deps) {
      let dep = dependents.get(d);
      if (!dep) {
        dep = new Set();
        dependents.set(d, dep);
      }
      dep.add(pointer);
    }

    if (deps.size === 0) heap.push(pointer);
  });

  const emitted = new Set<string>();
  const order: Array<string> = [];

  while (!heap.isEmpty()) {
    const cur = heap.pop()!;
    if (emitted.has(cur)) continue;
    emitted.add(cur);
    order.push(cur);

    const deps = dependents.get(cur);
    if (!deps) continue;

    for (const dep of deps) {
      const v = (inDegree.get(dep) ?? 0) - 1;
      inDegree.set(dep, v);
      if (v === 0) {
        heap.push(dep);
      }
    }
  }

  // emit remaining nodes (cycles) in declaration order
  const remaining = pointers.filter((pointer) => !emitted.has(pointer));
  remaining.sort((a, b) => declIndex.get(a)! - declIndex.get(b)!);
  for (const pointer of remaining) {
    emitted.add(pointer);
    order.push(pointer);
  }

  // prefer specified groups when safe
  let finalOrder = order;
  if (options?.preferGroups && options.preferGroups.length) {
    // build group priority map (lower = earlier)
    const groupPriority = new Map<string, number>();
    for (let i = 0; i < options.preferGroups.length; i++) {
      const k = options.preferGroups[i];
      if (k) {
        groupPriority.set(k, i);
      }
    }

    const getGroup: GetPointerPriorityFn = (pointer) => {
      if (options.matchPointerToGroup) {
        const result = options.matchPointerToGroup(pointer);
        if (result.matched) {
          return groupPriority.has(result.kind)
            ? groupPriority.get(result.kind)!
            : options.preferGroups!.length;
        }
      }
      return options.preferGroups!.length;
    };

    // proposed order: sort by (groupPriority, originalIndex)
    // Precompute original indices to avoid O(N) indexOf inside the comparator.
    const orderIndex = new Map<string, number>();
    for (let i = 0; i < order.length; i++) {
      orderIndex.set(order[i]!, i);
    }

    // Memoize getGroup results since matchPointerToGroup can be expensive.
    const groupCache = new Map<string, number>();
    const getCachedGroup = (pointer: string): number => {
      let g = groupCache.get(pointer);
      if (g === undefined) {
        g = getGroup(pointer);
        groupCache.set(pointer, g);
      }
      return g;
    };

    const proposed = [...order].sort((a, b) => {
      const ga = getCachedGroup(a);
      const gb = getCachedGroup(b);
      return ga !== gb ? ga - gb : orderIndex.get(a)! - orderIndex.get(b)!;
    });

    // build quick lookup of original index and proposed index
    const proposedIndex = new Map<string, number>();
    for (let i = 0; i < proposed.length; i++) {
      proposedIndex.set(proposed[i]!, i);
    }

    // only validate edges where group(dep) > group(node)
    const violated = (() => {
      for (const [node, deps] of depsOf) {
        for (const dep of deps) {
          const gDep = getCachedGroup(dep);
          const gNode = getCachedGroup(node);
          if (gDep <= gNode) continue; // not a crossing edge, cannot be violated by grouping
          const pDep = proposedIndex.get(dep)!;
          const pNode = proposedIndex.get(node)!;
          if (pDep >= pNode) {
            return true;
          }
        }
      }
      return false;
    })();

    if (!violated) {
      finalOrder = proposed;
    }
  }

  for (const pointer of finalOrder) {
    callback(pointer, graph.nodes.get(pointer)!);
  }
};

export const walk: WalkFn = (graph, callback, options) => {
  if (options?.order === 'topological') {
    return walkTopological(graph, callback, options);
  }
  return walkDeclarations(graph, callback, options);
};
