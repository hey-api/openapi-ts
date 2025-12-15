import { registryName } from '~/plugins/@hey-api/sdk/shared/class';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { $ } from '~/ts-dsl';
import { toCase } from '~/utils/to-case';

import type { SwrPlugin } from '../types';
import { createUseSwr } from './useSwr';

export const handlerV2: SwrPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: 'swr',
    importKind: 'default',
    kind: 'function',
    meta: {
      category: 'external',
      resource: 'swr',
    },
    name: 'useSWR',
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
        // if (plugin.config.queryOptions.enabled) {
        //   createQueryOptions({ operation, plugin, queryFn });
        // }

        // if (plugin.config.infiniteQueryOptions.enabled) {
        //   createInfiniteQueryOptions({ operation, plugin, queryFn });
        // }

        if (plugin.config.useSwr.enabled) {
          createUseSwr({ operation, plugin, queryFn });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
