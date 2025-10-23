import type { Graph, NodeInfo } from '~/openApi/shared/utils/graph';
import { MinHeap } from '~/utils/minHeap';

type KindPriority = Record<IrTopLevelKind, number>;
type PreferGroups = ReadonlyArray<IrTopLevelKind>;
type PriorityFn = (pointer: string) => number;

/**
 * Walks the nodes of the graph in topological order (dependencies before dependents).
 * Calls the callback for each node pointer in order.
 * Nodes in cycles are grouped together and emitted in arbitrary order within the group.
 *
 * @param graph - The dependency graph
 * @param callback - Function to call for each node pointer
 */
export const walkTopological = (
  graph: Graph,
  callback: (pointer: string, nodeInfo: NodeInfo) => void,
  options?: {
    preferGroups?: PreferGroups;
    priority?: PriorityFn;
  },
) => {
  // Stable Kahn's algorithm that respects declaration order as a tiebreaker.
  const pointers = Array.from(graph.nodes.keys());
  // Base insertion order
  const baseIndex = new Map<string, number>();
  pointers.forEach((pointer, index) => baseIndex.set(pointer, index));

  // Composite decl index: group priority then base insertion order
  const declIndex = new Map<string, number>();
  const priorityFn = options?.priority ?? defaultPriorityFn;
  for (const pointer of pointers) {
    const group = priorityFn(pointer) ?? 10;
    const composite = group * 1_000_000 + (baseIndex.get(pointer) ?? 0);
    declIndex.set(pointer, composite);
  }

  // Build dependency sets for each pointer (prefer subtreeDependencies, fall back to nodeDependencies)
  const depsOf = new Map<string, Set<string>>();
  for (const pointer of pointers) {
    const raw =
      graph.subtreeDependencies?.get(pointer) ??
      graph.nodeDependencies?.get(pointer) ??
      new Set();
    const filtered = new Set<string>();
    for (const rawPointer of raw) {
      if (rawPointer === pointer) continue; // ignore self-dependencies for ordering
      if (graph.nodes.has(rawPointer)) {
        filtered.add(rawPointer);
      }
    }
    depsOf.set(pointer, filtered);
  }

  // Build inDegree and dependents adjacency
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

  // Helper to sort pointers by declaration order
  const sortByDecl = (arr: Array<string>) =>
    arr.sort((a, b) => declIndex.get(a)! - declIndex.get(b)!);

  // Initialize queue with zero-inDegree nodes in declaration order
  // Use a small binary min-heap prioritized by declaration index to avoid repeated full sorts.
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
  const preferGroups = options?.preferGroups ?? defaultPreferGroups;
  if (preferGroups && preferGroups.length > 0) {
    // build group priority map (lower = earlier)
    const groupPriority = new Map<string, number>();
    for (let i = 0; i < preferGroups.length; i++) {
      const k = preferGroups[i];
      if (k) {
        groupPriority.set(k, i);
      }
    }

    const getGroup: PriorityFn = (pointer) => {
      const result = matchIrTopLevelPointer(pointer);
      if (result.matched) {
        return groupPriority.has(result.kind)
          ? groupPriority.get(result.kind)!
          : preferGroups.length;
      }
      return preferGroups.length;
    };

    // proposed order: sort by (groupPriority, originalIndex)
    const proposed = [...order].sort((a, b) => {
      const ga = getGroup(a);
      const gb = getGroup(b);
      return ga !== gb ? ga - gb : order.indexOf(a) - order.indexOf(b);
    });

    // Build quick lookup of original index and proposed index
    const proposedIndex = new Map<string, number>();
    for (let i = 0; i < proposed.length; i++) {
      proposedIndex.set(proposed[i]!, i);
    }

    // Micro-optimization: only validate edges where group(dep) > group(node)
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

  // Finally, call back in final order
  for (const pointer of finalOrder) {
    callback(pointer, graph.nodes.get(pointer)!);
  }
};

export const irTopLevelKinds = [
  'operation',
  'parameter',
  'requestBody',
  'schema',
  'server',
  'webhook',
] as const;

export type IrTopLevelKind = (typeof irTopLevelKinds)[number];

export type IrTopLevelPointerMatch =
  | { kind: IrTopLevelKind; matched: true }
  | { kind?: undefined; matched: false };

/**
 * Checks if a pointer matches a known top-level IR component (schema, parameter, etc) and returns match info.
 *
 * @param pointer - The IR pointer string (e.g. '#/components/schemas/Foo')
 * @param kind - (Optional) The component kind to check
 * @returns { matched: true, kind: IrTopLevelKind } | { matched: false } - Whether it matched, and the matched kind if so
 */
export const matchIrTopLevelPointer = (
  pointer: string,
  kind?: IrTopLevelKind,
): IrTopLevelPointerMatch => {
  const patterns: Record<IrTopLevelKind, RegExp> = {
    operation:
      /^#\/paths\/[^/]+\/(get|put|post|delete|options|head|patch|trace)$/,
    parameter: /^#\/components\/parameters\/[^/]+$/,
    requestBody: /^#\/components\/requestBodies\/[^/]+$/,
    schema: /^#\/components\/schemas\/[^/]+$/,
    server: /^#\/servers\/(\d+|[^/]+)$/,
    webhook:
      /^#\/webhooks\/[^/]+\/(get|put|post|delete|options|head|patch|trace)$/,
  };
  if (kind) {
    return patterns[kind].test(pointer)
      ? { kind, matched: true }
      : { matched: false };
  }
  for (const key of Object.keys(patterns)) {
    const kind = key as IrTopLevelKind;
    if (patterns[kind].test(pointer)) {
      return { kind, matched: true };
    }
  }
  return { matched: false };
};

// default grouping preference (earlier groups emitted first when safe)
export const defaultPreferGroups = [
  'schema',
  'parameter',
  'requestBody',
  'operation',
  'server',
  'webhook',
] satisfies PreferGroups;

// default group priority (lower = earlier)
// built from `defaultPreferGroups` so the priority order stays in sync with the prefer-groups array.
const defaultKindPriority: KindPriority = (() => {
  const partial: Partial<KindPriority> = {};
  for (let i = 0; i < defaultPreferGroups.length; i++) {
    const k = defaultPreferGroups[i];
    if (k) partial[k] = i;
  }
  // Ensure all known kinds exist in the map (fall back to a high index).
  for (const k of irTopLevelKinds) {
    if (partial[k] === undefined) {
      partial[k] = defaultPreferGroups.length;
    }
  }
  return partial as KindPriority;
})();

const defaultPriorityFn: PriorityFn = (pointer) => {
  const result = matchIrTopLevelPointer(pointer);
  if (result.matched) {
    return defaultKindPriority[result.kind] ?? 10;
  }
  return 10;
};
