import { createMutationOptions } from '../mutationOptions';
import { createQueryOptions } from '../queryOptions';
import type { PiniaColadaPlugin } from '../types';

export const handlerV0: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('defineQueryOptions', {
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.defineQueryOptions`,
    },
  });
  plugin.symbol('UseMutationOptions', {
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.UseMutationOptions`,
    },
  });
  plugin.symbol('UseQueryOptions', {
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.UseQueryOptions`,
    },
  });
  plugin.symbol('_JSONValue', {
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}._JSONValue`,
    },
  });
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
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.mutationOptions.enabled) {
          createMutationOptions({ operation, plugin });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
