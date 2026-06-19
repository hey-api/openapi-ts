import { StructureModel } from '@hey-api/codegen-core';

import type { $ } from '../../../../ts-dsl';
import { resolveStrategy } from '../operations';
import { createTypeOptions } from '../shared/type-options';
import type { HeyApiSdkPlugin } from '../types';
import type { OperationItem } from './node';
import { createShell, source, toNode } from './node';

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  createTypeOptions({ plugin });

  const structure = new StructureModel();
  const shell = createShell(plugin);
  const strategy = resolveStrategy(plugin);

  plugin.forEach(
    'operation',
    (event) => {
      structure.insert({
        data: {
          operation: event.operation,
          path: event._path,
          tags: event.tags,
        } satisfies OperationItem,
        locations: strategy(event.operation).map((path) => ({ path, shell })),
        source,
      });
    },
    { order: 'declarations' },
  );

  const allDependencies: Array<ReturnType<typeof $.class | typeof $.var>> = [];
  const allNodes: Array<ReturnType<typeof $.class | typeof $.var>> = [];

  for (const node of structure.walk()) {
    const { dependencies, nodes } = toNode(node, plugin);
    allDependencies.push(...(dependencies ?? []));
    allNodes.push(...nodes);
  }

  const uniqueDependencies = new Map<number, ReturnType<typeof $.class | typeof $.var>>();
  for (const dep of allDependencies) {
    if (dep.symbol) uniqueDependencies.set(dep.symbol.id, dep);
  }
  for (const dep of uniqueDependencies.values()) {
    plugin.node(dep);
  }

  for (const node of allNodes) {
    plugin.node(node);
  }
};
