import { createMutationOptions } from '../mutation-options';
import { createQueryOptions } from '../query-options';
import type { PiniaColadaPlugin } from '../types';

export const handlerV0: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
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
