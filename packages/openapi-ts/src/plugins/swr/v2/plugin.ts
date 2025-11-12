<<<<<<< HEAD
import type { SwrPlugin } from '../types';
import { createUseSwr } from './useSwr';

import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { stringCase } from '~/utils/stringCase';
import { createSwrInfiniteOptions } from './swrInfiniteOptions';
import { createSwrMutationOptions } from './swrMutationOptions';
import { createSwrOptions } from './swrOptions';

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

      // Get the SDK function name
      const classes = sdkPlugin.config.asClass
        ? operationClasses({
            context: plugin.context,
            operation,
            plugin: sdkPlugin,
          })
        : undefined;
      const entry = classes ? classes.values().next().value : undefined;
      const sdkFn = entry
        ? [
            plugin.referenceSymbol({
              category: 'utility',
              resource: 'class',
              resourceId: entry.path[0],
              tool: 'sdk',
            }).placeholder,
            ...entry.path.slice(1).map((className) =>
              stringCase({
                case: 'camelCase',
                value: className,
              }),
            ),
            entry.methodName,
          ]
            .filter(Boolean)
            .join('.')
        : plugin.referenceSymbol({
            category: 'sdk',
            resource: 'operation',
            resourceId: operation.id,
          }).placeholder;

      // Generate appropriate SWR functions based on operation type
      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.swrOptions.enabled) {
          createSwrOptions({ operation, plugin, sdkFn });
        }
        if (plugin.config.swrInfiniteOptions.enabled) {
          createSwrInfiniteOptions({ operation, plugin, sdkFn });
        }
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.swrMutationOptions.enabled) {
          createSwrMutationOptions({ operation, plugin, sdkFn });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
