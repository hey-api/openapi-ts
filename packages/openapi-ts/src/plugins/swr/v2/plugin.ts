import type { SwrPlugin } from '../types';
import { createUseSwr } from './use-swr';

export const handlerV2: SwrPlugin['Handler'] = ({ plugin }) => {
  plugin.forEach(
    'operation',
    ({ operation }) => {
      if (plugin.hooks.operation.isQuery(operation)) {
        // if (plugin.config.queryOptions.enabled) {
        //   createQueryOptions({ operation, plugin });
        // }

        // if (plugin.config.infiniteQueryOptions.enabled) {
        //   createInfiniteQueryOptions({ operation, plugin });
        // }

        if (plugin.config.useSwr.enabled) {
          createUseSwr({ operation, plugin });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
