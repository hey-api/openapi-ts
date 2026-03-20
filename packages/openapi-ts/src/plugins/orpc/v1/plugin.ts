import { StructureModel } from '@hey-api/codegen-core';

import { $ } from '../../../ts-dsl';
import type { ContractItem } from '../contracts';
import { createShell, resolveStrategy, source, toNode } from '../contracts';
import type { OrpcPlugin } from '../types';

export const handlerV1: OrpcPlugin['Handler'] = ({ plugin }) => {
  const oc = plugin.symbol('oc', {
    external: '@orpc/contract',
  });
  const baseSymbol = plugin.symbol('base');

  const baseNode = $.const(baseSymbol)
    .export()
    .assign(
      $(oc)
        .attr('$route')
        .call($.object().prop('inputStructure', $.literal('detailed'))),
    );
  plugin.node(baseNode);

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
        } satisfies ContractItem,
        locations: strategy(event.operation).map((path) => ({ path, shell })),
        source,
      });
    },
    { order: 'declarations' },
  );

  const allNodes: Array<ReturnType<typeof $.class | typeof $.var>> = [];

  for (const node of structure.walk()) {
    const { nodes } = toNode(node, plugin, baseSymbol);
    allNodes.push(...nodes);
  }

  for (const node of allNodes) {
    plugin.node(node);
  }
};
