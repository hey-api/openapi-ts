import type { NodeName, Symbol } from '@hey-api/codegen-core';
import { StructureModel } from '@hey-api/codegen-core';
import { applyNaming, toCase } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { ContractItem } from '../contracts';
import { createShell, resolveStrategy, source, toNode } from '../contracts';
import { getOperationPaths } from '../shared/operation';
import type { OrpcContractPlugin } from '../types';

type NestedLeaf = { type: 'leaf'; value: NodeName };
type NestedNode = { children: Map<string, NestedValue>; type: 'node' };
type NestedValue = NestedLeaf | NestedNode;

function buildNestedObject(node: NestedNode): ReturnType<typeof $.object> {
  const obj = $.object();
  for (const [key, child] of node.children) {
    if (child.type === 'leaf') {
      obj.prop(key, $(child.value));
    } else {
      obj.prop(key, buildNestedObject(child));
    }
  }
  return obj;
}

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

  // Track contract symbols for router generation (keyed by operation ID)
  const contractSymbols = new Map<string, Symbol>();
  // Router nested structure (to be refactored later)
  const routerRoot: NestedNode = { children: new Map(), type: 'node' };
  // Track router leaf nodes by operation ID for later symbol assignment
  const routerLeaves = new Map<string, NestedLeaf>();

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

      const routerPaths = getOperationPaths(operation, plugin.config.router);
      for (const path of routerPaths) {
        let current: NestedNode = routerRoot;
        for (let i = 0; i < path.length; i++) {
          const isLast = i === path.length - 1;
          const segment = isLast
            ? applyNaming(path[i]!, plugin.config.router.methodName)
            : applyNaming(path[i]!, plugin.config.router.segmentName);

          if (isLast) {
            const leaf: NestedLeaf = {
              type: 'leaf',
              value: undefined as unknown as NodeName, // placeholder, updated after contracts are generated
            };
            current.children.set(segment, leaf);
            routerLeaves.set(operation.id, leaf);
          } else {
            if (!current.children.has(segment)) {
              current.children.set(segment, {
                children: new Map(),
                type: 'node',
              });
            }
            const next = current.children.get(segment)!;
            if (next.type === 'node') {
              current = next;
            }
          }
        }
      }
    },
    { order: 'declarations' },
  );

  for (const node of contractsStructure.walk()) {
    const { nodes, symbols } = toNode(node, plugin, baseSymbol);

    if (symbols) {
      for (const [operationId, sym] of symbols) {
        contractSymbols.set(operationId, sym);
      }
    }

    for (const node of nodes) {
      plugin.node(node);
    }
  }

  for (const [operationId, leaf] of routerLeaves) {
    const sym = contractSymbols.get(operationId);
    if (sym) {
      leaf.value = sym;
    }
  }

  const routerExportName = applyNaming('router', plugin.config.routerName);
  const routerSymbol = plugin.symbol(routerExportName, {
    meta: {
      category: 'contract',
      resource: 'router',
      tool: plugin.name,
    },
  });
  const routerNode = $.const(routerSymbol).export().assign(buildNestedObject(routerRoot).pretty());
  plugin.node(routerNode);

  const routerTypeName = toCase(routerExportName, 'PascalCase');
  const routerTypeSymbol = plugin.symbol(routerTypeName, {
    meta: {
      category: 'type',
      resource: 'router',
      tool: plugin.name,
    },
  });
  const routerTypeNode = $.type.alias(routerTypeSymbol).export().type($.type.query(routerSymbol));
  plugin.node(routerTypeNode);
};
