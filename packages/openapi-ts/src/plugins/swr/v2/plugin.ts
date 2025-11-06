import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { stringCase } from '~/utils/stringCase';

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
        ? operationClasses({
            context: plugin.context,
            operation,
            plugin: sdkPlugin,
          })
        : undefined;
      const entry = classes ? classes.values().next().value : undefined;
      const queryFn =
        // TODO: this should use class graph to determine correct path string
        // as it's really easy to break once we change the class casing
        entry
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
