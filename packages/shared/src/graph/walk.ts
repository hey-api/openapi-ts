import { MinHeap } from '../utils/minHeap';
import type { GetPointerPriorityFn, WalkFn } from './types/walk';

/**
 * Walk the nodes of the graph in declaration (insertion) order.
 * This is a cheap alternative to `walkTopological` when dependency ordering
 * is not required and the caller only wants nodes in the order they were
 * added to the graph.
 */
const walkDeclarations: WalkFn = (graph, callback, options) => {
  const pointers = Array.from(graph.nodes.keys());

  if (options?.preferGroups && options.preferGroups.length > 0) {
    // emit nodes that match each preferred group in order, preserving insertion order
    const emitted = new Set<string>();
    if (options.matchPointerToGroup) {
      for (const kind of options.preferGroups) {
        for (const pointer of pointers) {
          const result = options.matchPointerToGroup(pointer);
          if (!result.matched) continue;
          if (result.kind === kind) {
            emitted.add(pointer);
            callback(pointer, graph.nodes.get(pointer)!);
          }
        }
      }
    }

    // emit anything not covered by the preferGroups (in declaration order)
    for (const pointer of pointers) {
      if (emitted.has(pointer)) continue;
      callback(pointer, graph.nodes.get(pointer)!);
    }
    return;
  }

  // fallback: simple declaration order
  for (const pointer of pointers) {
    callback(pointer, graph.nodes.get(pointer)!);
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
  // base insertion order
  const baseIndex = new Map<string, number>();
  pointers.forEach((pointer, index) => baseIndex.set(pointer, index));

  // composite decl index: group priority then base insertion order
  const declIndex = new Map<string, number>();
  for (const pointer of pointers) {
    const priority = options?.getPointerPriority?.(pointer) ?? 10;
    const composite = priority * 1_000_000 + (baseIndex.get(pointer) ?? 0);
    declIndex.set(pointer, composite);
  }

  // build dependency sets for each pointer
  const depsOf = new Map<string, Set<string>>();
  for (const pointer of pointers) {
    const raw = graph.subtreeDependencies?.get(pointer) ?? new Set();
    const filtered = new Set<string>();
    for (const rawPointer of raw) {
      if (rawPointer === pointer) continue; // ignore self-dependencies for ordering
      if (graph.nodes.has(rawPointer)) {
        filtered.add(rawPointer);
      }
    }
    depsOf.set(pointer, filtered);
  }

  // build inDegree and dependents adjacency
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, Set<string>>();
  for (const pointer of pointers) {
    inDegree.set(pointer, 0);
  }
  for (const [pointer, deps] of depsOf) {
    inDegree.set(pointer, deps.size);
    for (const d of deps) {
      if (!dependents.has(d)) {
        dependents.set(d, new Set());
      }
      dependents.get(d)!.add(pointer);
    }
  }

  // sort pointers by declaration order
  const sortByDecl = (arr: Array<string>) =>
    arr.sort((a, b) => declIndex.get(a)! - declIndex.get(b)!);

  // initialize queue with zero-inDegree nodes in declaration order
  // use min-heap prioritized by declaration index to avoid repeated full sorts
  const heap = new MinHeap(declIndex);
  for (const pointer of pointers) {
    if ((inDegree.get(pointer) ?? 0) === 0) {
      heap.push(pointer);
    }
  }

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
  sortByDecl(remaining);
  for (const pointer of remaining) {
    emitted.add(pointer);
    order.push(pointer);
  }

  // prefer specified groups when safe
  let finalOrder = order;
  if (options?.preferGroups && options.preferGroups.length > 0) {
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
    const proposed = [...order].sort((a, b) => {
      const ga = getGroup(a);
      const gb = getGroup(b);
      return ga !== gb ? ga - gb : order.indexOf(a) - order.indexOf(b);
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
          const gDep = getGroup(dep);
          const gNode = getGroup(node);
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
