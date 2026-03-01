import type { PluginHandler } from '../types';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import { createUseMutation } from './useMutation';
import { createUseQuery } from './useQuery';

export const handlerV5: PluginHandler = ({ plugin }) => {
  plugin.symbol('DefaultError', {
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.DefaultError`,
    },
  });
  plugin.symbol('InfiniteData', {
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.InfiniteData`,
    },
  });
  const mutationsType =
    plugin.name === '@tanstack/angular-query-experimental' ||
    plugin.name === '@tanstack/svelte-query' ||
    plugin.name === '@tanstack/solid-query'
      ? 'MutationOptions'
      : 'UseMutationOptions';
  plugin.symbol(mutationsType, {
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.MutationOptions`,
    },
  });
  plugin.symbol('infiniteQueryOptions', {
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.infiniteQueryOptions`,
    },
  });
  plugin.symbol('queryOptions', {
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.queryOptions`,
    },
  });
  if ('useQuery' in plugin.config) {
    plugin.symbol('useQuery', {
      external: plugin.name,
      meta: {
        category: 'external',
        resource: `${plugin.name}.useQuery`,
      },
    });
  }
  if ('useMutation' in plugin.config) {
    plugin.symbol('useMutation', {
      external: plugin.name,
      meta: {
        category: 'external',
        resource: `${plugin.name}.useMutation`,
      },
    });
  }
  plugin.symbol('AxiosError', {
    external: 'axios',
    kind: 'type',
    meta: {
      category: 'external',
      resource: 'axios.AxiosError',
    },
  });

  plugin.forEach(
    'operation',
    ({ operation }) => {
      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.queryOptions.enabled) {
          createQueryOptions({ operation, plugin });
        }

        if (plugin.config.infiniteQueryOptions.enabled) {
          createInfiniteQueryOptions({ operation, plugin });
        }

        if ('useQuery' in plugin.config && plugin.config.useQuery.enabled) {
          createUseQuery({ operation, plugin });
        }
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.mutationOptions.enabled) {
          createMutationOptions({ operation, plugin });
        }

        if ('useMutation' in plugin.config && plugin.config.useMutation.enabled) {
          createUseMutation({ operation, plugin });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
