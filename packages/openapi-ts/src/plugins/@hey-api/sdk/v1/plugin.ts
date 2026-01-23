import { StructureModel } from '@hey-api/codegen-core';

import { getTypedConfig } from '~/config/utils';
import { clientFolderAbsolutePath } from '~/generate/client';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import type { $ } from '~/ts-dsl';

import { resolveStrategy } from '../operations';
import { createTypeOptions } from '../shared/typeOptions';
import type { HeyApiSdkPlugin } from '../types';
import type { OperationItem } from './node';
import { createShell, source, toNode } from './node';

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const client = getClientPlugin(getTypedConfig(plugin));
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  plugin.symbol('formDataBodySerializer', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.formDataBodySerializer',
      tool: client.name,
    },
  });
  plugin.symbol('urlSearchParamsBodySerializer', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.urlSearchParamsBodySerializer',
      tool: client.name,
    },
  });
  plugin.symbol('buildClientParams', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.buildClientParams',
      tool: client.name,
    },
  });
  if (isNuxtClient) {
    plugin.symbol('Composable', {
      external: clientModule,
      kind: 'type',
      meta: {
        category: 'external',
        resource: 'client.Composable',
        tool: client.name,
      },
    });
  }
  if (isAngularClient) {
    plugin.symbol('Injectable', {
      external: '@angular/core',
      meta: {
        category: 'external',
        resource: '@angular/core.Injectable',
      },
    });
  }

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

  const uniqueDependencies = new Map<
    number,
    ReturnType<typeof $.class | typeof $.var>
  >();
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
