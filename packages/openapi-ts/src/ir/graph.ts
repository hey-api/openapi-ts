import type { Graph, NodeInfo } from '../openApi/shared/utils/graph';

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
) => {
  const visited = new Set<string>();

  const visit = (pointer: string) => {
    if (visited.has(pointer)) return;
    visited.add(pointer);

    const dependencies = graph.subtreeDependencies.get(pointer);
    if (dependencies) {
      for (const dependency of dependencies) {
        visit(dependency);
      }
    }

    callback(pointer, graph.nodes.get(pointer)!);
  };

  for (const pointer of graph.nodes.keys()) {
    visit(pointer);
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
