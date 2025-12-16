import { clientFolderAbsolutePath } from '~/generate/client';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import type { $ } from '~/ts-dsl';

import { SdkStructureModel } from '../model/structure';
import { createTypeOptions } from '../shared/typeOptions';
import type { HeyApiSdkPlugin } from '../types';

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const client = getClientPlugin(plugin.context.config);
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
  if (isAngularClient && plugin.config.asClass) {
    plugin.symbol('Injectable', {
      external: '@angular/core',
      meta: {
        category: 'external',
        resource: '@angular/core.Injectable',
      },
    });
  }

  createTypeOptions({ plugin });

  const structure = plugin.config.asClass
    ? new SdkStructureModel(plugin.config.instance)
    : new SdkStructureModel('', { flat: true });

  plugin.forEach(
    'operation',
    (event) => {
      structure.insert(
        {
          operation: event.operation,
          path: event._path,
          tags: event.tags,
        },
        plugin,
      );
    },
    { order: 'declarations' },
  );

  const allDependencies: Array<ReturnType<typeof $.class>> = [];
  const allNodes: Array<ReturnType<typeof $.class | typeof $.var>> = [];

  for (const model of structure.walk()) {
    const { dependencies, nodes } = model.toNode(plugin);
    allDependencies.push(...dependencies);
    allNodes.push(...nodes);
  }

  const uniqueDependencies = new Map<number, ReturnType<typeof $.class>>();
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
