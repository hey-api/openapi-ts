import type { PluginHandler, PluginInstance } from '../types';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import { createUseMutation } from './useMutation';
import { createUseQuery } from './useQuery';

const createQueryStyleNames = new Set<PluginInstance['name']>([
  '@tanstack/angular-query-experimental',
  '@tanstack/solid-query',
  '@tanstack/svelte-query',
]);

const getMutationOptionsType = (name: PluginInstance['name']) =>
  createQueryStyleNames.has(name) ? 'MutationOptions' : 'UseMutationOptions';

export const handlerV5: PluginHandler = ({ plugin }) => {
  plugin.symbol('DefaultError', {
    external: plugin.name,
    kind: 'type',
  });
  plugin.symbol('InfiniteData', {
    external: plugin.name,
    kind: 'type',
  });
  plugin.symbol(getMutationOptionsType(plugin.name), {
    external: plugin.name,
    kind: 'type',
    meta: {
      resource: `${plugin.name}.MutationOptions`,
    },
  });
  plugin.symbol('infiniteQueryOptions', {
    external: plugin.name,
  });
  plugin.symbol('queryOptions', {
    external: plugin.name,
  });
  plugin.symbol('useMutation', {
    external: plugin.name,
  });
  plugin.symbol('useQuery', {
    external: plugin.name,
  });
  plugin.symbol('skipToken', {
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.skipToken`,
    },
  });

  plugin.symbol('AxiosError', {
    external: 'axios',
    kind: 'type',
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
