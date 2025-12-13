import { registryName } from '~/plugins/@hey-api/sdk/shared/class';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { $ } from '~/ts-dsl';
import { stringCase } from '~/utils/stringCase';

import type { SwrPlugin } from '../types';
import { createSwrInfiniteOptions } from './swrInfiniteOptions';
import { createSwrMutationOptions } from './swrMutationOptions';
import { createSwrOptions } from './swrOptions';

/**
 * Main handler for the SWR plugin (v2).
 *
 * This plugin generates useSWR and useSWRMutation options for each operation.
 * It follows SWR's official recommended patterns for key design and data fetching.
 */
export const handlerV2: SwrPlugin['Handler'] = ({ plugin }) => {
  // Register external symbols from axios (for error types)
  plugin.registerSymbol({
    external: 'axios',
    kind: 'type',
    meta: {
      category: 'external',
      resource: 'axios.AxiosError',
    },
    name: 'AxiosError',
  });

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  // Iterate over all operations
  plugin.forEach(
    'operation',
    ({ operation }) => {
      // Get the SDK function name
      const classes = sdkPlugin.config.asClass
        ? operationClasses({
            context: plugin.context,
            operation,
            plugin: sdkPlugin,
          })
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
          const cls = stringCase({
            case: 'camelCase',
            value: className,
          });
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

      // Generate appropriate SWR functions based on operation type
      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.swrOptions.enabled) {
          createSwrOptions({ operation, plugin, queryFn });
        }
        if (plugin.config.swrInfiniteOptions.enabled) {
          createSwrInfiniteOptions({ operation, plugin, queryFn });
        }
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.swrMutationOptions.enabled) {
          createSwrMutationOptions({ operation, plugin, queryFn });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
