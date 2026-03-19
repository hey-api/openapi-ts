import { StructureModel } from '@hey-api/codegen-core';

import { $ } from '../../../../ts-dsl';
import type { ContractItem } from '../contracts';
import { createShell, resolveStrategy, source, toNode } from '../contracts';
import type { OrpcContractPlugin } from '../types';

export const handlerV1: OrpcContractPlugin['Handler'] = ({ plugin }) => {
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

  const contractsStructure = new StructureModel();
  const contractsShell = createShell(plugin);
  const contractsStrategy = resolveStrategy(plugin);

  plugin.forEach(
    'operation',
    (event) => {
      const { operation } = event;

      const contractPaths = contractsStrategy(operation);
      contractsStructure.insert({
        data: {
          operation,
          path: event._path,
          tags: event.tags,
        } satisfies ContractItem,
        locations: contractPaths.map((path) => ({ path, shell: contractsShell })),
        source,
      });
    },
    { order: 'declarations' },
  );

  for (const node of contractsStructure.walk()) {
    const { nodes } = toNode(node, plugin, baseSymbol);

    for (const node of nodes) {
      plugin.node(node);
    }
  }
};
