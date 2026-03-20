import { createMutationOptions } from '../mutationOptions';
import { createQueryOptions } from '../queryOptions';
import type { PiniaColadaPlugin } from '../types';

export const handlerV0: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('defineQueryOptions', {
    external: plugin.name,
  });
  plugin.symbol('UseMutationOptions', {
    external: plugin.name,
    kind: 'type',
  });
  plugin.symbol('UseQueryOptions', {
    external: plugin.name,
    kind: 'type',
  });
  plugin.symbol('_JSONValue', {
    external: plugin.name,
    kind: 'type',
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
