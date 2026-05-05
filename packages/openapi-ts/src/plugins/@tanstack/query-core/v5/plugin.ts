import type { PluginHandler, PluginInstance } from '../types';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import { createSetQueryData } from './setQueryData';
import { createUseMutation } from './useMutation';
import { createUseQuery } from './useQuery';
import { createUseSetQueryData } from './useSetQueryData';

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
  plugin.symbol('QueryClient', {
    external: plugin.name,
    kind: 'type',
    meta: {
      resource: `${plugin.name}.QueryClient`,
    },
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
  plugin.symbol('useQueryClient', {
    external: plugin.name,
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

        if (plugin.config.setQueryData.enabled) {
          createSetQueryData({ operation, plugin });
        }

        if ('useQuery' in plugin.config && plugin.config.useQuery.enabled) {
          createUseQuery({ operation, plugin });
        }

        if ('useSetQueryData' in plugin.config && plugin.config.useSetQueryData.enabled) {
          createUseSetQueryData({ operation, plugin });
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
