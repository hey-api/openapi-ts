import type { SwrPlugin } from '../types';
import { createUseSwr } from './useSwr';

export const handlerV2: SwrPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('useSWR', {
    external: 'swr',
    importKind: 'default',
    kind: 'function',
    meta: {
      category: 'external',
      resource: 'swr',
    },
  });

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
