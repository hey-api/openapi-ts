import { StructureModel } from '@hey-api/codegen-core';

import { getTypedConfig } from '../../../../config/utils';
import { clientFolderAbsolutePath } from '../../../../generate/client';
import type { $ } from '../../../../py-dsl';
import { getClientPlugin } from '../../client-core/utils';
import { resolveStrategy } from '../operations';
import type { HeyApiSdkPlugin } from '../types';
import { createShell, type OperationItem, source, toNode } from './node';

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const client = getClientPlugin(getTypedConfig(plugin));
  plugin.symbol('Client', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.Client',
      tool: client.name,
    },
  });

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

  const allDependencies: Array<ReturnType<typeof $.class | typeof $.func>> = [];
  const allNodes: Array<ReturnType<typeof $.class | typeof $.func>> = [];

  for (const node of structure.walk()) {
    const { dependencies, nodes } = toNode(node, plugin);
    allDependencies.push(...(dependencies ?? []));
    allNodes.push(...nodes);
  }

  for (const dep of allDependencies) {
    plugin.node(dep);
  }

  for (const node of allNodes) {
    plugin.node(node);
  }
};
