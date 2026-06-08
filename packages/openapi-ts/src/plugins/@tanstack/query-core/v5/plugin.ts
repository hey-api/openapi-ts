import type { PluginHandler } from '../types';
import { createGetQueryData } from './getQueryData';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import { createSetQueryData } from './setQueryData';
import { createUseGetQueryData } from './useGetQueryData';
import { createUseMutation } from './useMutation';
import { createUseQuery } from './useQuery';
import { createUseSetQueryData } from './useSetQueryData';

export const handlerV5: PluginHandler = ({ plugin }) => {
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

        if (plugin.config.getQueryData.enabled) {
          createGetQueryData({ operation, plugin });
        }

        if (plugin.config.setQueryData.enabled) {
          createSetQueryData({ operation, plugin });
        }

        if ('useGetQueryData' in plugin.config && plugin.config.useGetQueryData.enabled) {
          createUseGetQueryData({ operation, plugin });
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
