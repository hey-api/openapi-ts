import { StructureModel } from '@hey-api/codegen-core';

import type { $ } from '~/ts-dsl';

import { resolveHttpRequestsStrategy } from './httpRequests';
import { resolveHttpResourcesStrategy } from './httpResources';
import type { OperationItem } from './shared/node';
import {
  createHttpRequestShell,
  createHttpResourceShell,
  source,
  toHttpRequestNode,
  toHttpResourceNode,
} from './shared/node';
import type { AngularCommonPlugin } from './types';

export const handler: AngularCommonPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('HttpRequest', {
    external: '@angular/common/http',
    kind: 'type',
    meta: {
      category: 'external',
      resource: '@angular/common/http.HttpRequest',
    },
  });
  plugin.symbol('inject', {
    external: '@angular/core',
    meta: {
      category: 'external',
      resource: '@angular/core.inject',
    },
  });
  plugin.symbol('Injectable', {
    external: '@angular/core',
    meta: {
      category: 'external',
      resource: '@angular/core.Injectable',
    },
  });
  plugin.symbol('httpResource', {
    external: '@angular/common/http',
    meta: {
      category: 'external',
      resource: '@angular/common/http.httpResource',
    },
  });

  const httpRequestStructure = new StructureModel();
  const httpResourceStructure = new StructureModel();

  if (plugin.config.httpRequests.enabled) {
    const shell = createHttpRequestShell(plugin);
    const strategy = resolveHttpRequestsStrategy(plugin);

    plugin.forEach(
      'operation',
      ({ operation }) => {
        httpRequestStructure.insert({
          data: {
            operation,
          } satisfies OperationItem,
          locations: strategy(operation).map((path) => ({ path, shell })),
          source,
        });
      },
      { order: 'declarations' },
    );
  }

  if (plugin.config.httpResources.enabled) {
    const shell = createHttpResourceShell(plugin);
    const strategy = resolveHttpResourcesStrategy(plugin);

    plugin.forEach(
      'operation',
      ({ operation }) => {
        httpResourceStructure.insert({
          data: {
            operation,
          } satisfies OperationItem,
          locations: strategy(operation).map((path) => ({ path, shell })),
          source,
        });
      },
      { order: 'declarations' },
    );
  }

  const allDependencies: Array<ReturnType<typeof $.class | typeof $.var>> = [];
  const allNodes: Array<ReturnType<typeof $.class | typeof $.var>> = [];

  for (const node of httpRequestStructure.walk()) {
    const { dependencies, nodes } = toHttpRequestNode(node, plugin);
    allDependencies.push(...(dependencies ?? []));
    allNodes.push(...nodes);
  }
  for (const node of httpResourceStructure.walk()) {
    const { dependencies, nodes } = toHttpResourceNode(node, plugin);
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
