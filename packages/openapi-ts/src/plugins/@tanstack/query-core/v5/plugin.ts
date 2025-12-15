import { registryName } from '~/plugins/@hey-api/sdk/shared/class';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { $ } from '~/ts-dsl';
import { toCase } from '~/utils/to-case';

import type { PluginHandler } from '../types';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import { createUseQuery } from './useQuery';

export const handlerV5: PluginHandler = ({ plugin }) => {
  plugin.registerSymbol({
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.DefaultError`,
    },
    name: 'DefaultError',
  });
  plugin.registerSymbol({
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.InfiniteData`,
    },
    name: 'InfiniteData',
  });
  const mutationsType =
    plugin.name === '@tanstack/angular-query-experimental' ||
    plugin.name === '@tanstack/svelte-query' ||
    plugin.name === '@tanstack/solid-query'
      ? 'MutationOptions'
      : 'UseMutationOptions';
  plugin.registerSymbol({
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.MutationOptions`,
    },
    name: mutationsType,
  });
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.infiniteQueryOptions`,
    },
    name: 'infiniteQueryOptions',
  });
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.queryOptions`,
    },
    name: 'queryOptions',
  });
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.useQuery`,
    },
    name: 'useQuery',
  });
  plugin.registerSymbol({
    external: 'axios',
    kind: 'type',
    meta: {
      category: 'external',
      resource: 'axios.AxiosError',
    },
    name: 'AxiosError',
  });

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const classes = sdkPlugin.config.asClass
        ? operationClasses({ operation, plugin: sdkPlugin })
        : undefined;
      const entry = classes ? classes.values().next().value : undefined;
      // TODO: this should use class graph to determine correct path string
      // as it's really easy to break once we change the class casing
      let queryFn: ReturnType<typeof $.expr | typeof $.call | typeof $.attr>;
      if (entry) {
        const symbolClass = plugin.referenceSymbol({
          category: 'utility',
          resource: 'class',
          resourceId: entry.path[0],
          tool: 'sdk',
        });
        queryFn = $(symbolClass).$if(sdkPlugin.config.instance, (e) =>
          e.attr(registryName).attr('get').call(),
        );
        for (const className of entry.path.slice(1)) {
          const cls = toCase(className, 'camelCase');
          queryFn = queryFn.attr(cls);
        }
        queryFn = queryFn.attr(entry.methodName);
      } else {
        const symbol = plugin.referenceSymbol({
          category: 'sdk',
          resource: 'operation',
          resourceId: operation.id,
        });
        queryFn = $(symbol);
      }

      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.queryOptions.enabled) {
          createQueryOptions({ operation, plugin, queryFn });
        }

        if (plugin.config.infiniteQueryOptions.enabled) {
          createInfiniteQueryOptions({ operation, plugin, queryFn });
        }

        if ('useQuery' in plugin.config && plugin.config.useQuery.enabled) {
          createUseQuery({ operation, plugin });
        }
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.mutationOptions.enabled) {
          createMutationOptions({ operation, plugin, queryFn });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
