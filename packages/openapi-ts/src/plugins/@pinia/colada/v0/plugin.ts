import { registryName } from '~/plugins/@hey-api/sdk/shared/class';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { stringCase } from '~/utils/stringCase';

import { createMutationOptions } from '../mutationOptions';
import { createQueryOptions } from '../queryOptions';
import type { PiniaColadaPlugin } from '../types';

export const handlerV0: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      category: 'external',
      resource: `${plugin.name}.defineQueryOptions`,
    },
    name: 'defineQueryOptions',
  });
  plugin.registerSymbol({
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.UseMutationOptions`,
    },
    name: 'UseMutationOptions',
  });
  plugin.registerSymbol({
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}.UseQueryOptions`,
    },
    name: 'UseQueryOptions',
  });
  plugin.registerSymbol({
    external: plugin.name,
    kind: 'type',
    meta: {
      category: 'external',
      resource: `${plugin.name}._JSONValue`,
    },
    name: '_JSONValue',
  });
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
      let queryFn: string;
      if (entry) {
        const symbolClass = plugin.referenceSymbol({
          category: 'utility',
          resource: 'class',
          resourceId: entry.path[0],
          tool: 'sdk',
        });
        queryFn = [
          symbolClass.placeholder,
          ...(sdkPlugin.config.instance ? [registryName, 'get()'] : []),
          ...entry.path.slice(1).map((className) =>
            stringCase({
              case: 'camelCase',
              value: className,
            }),
          ),
          entry.methodName,
        ]
          .filter(Boolean)
          .join('.');
      } else {
        queryFn = plugin.referenceSymbol({
          category: 'sdk',
          resource: 'operation',
          resourceId: operation.id,
        }).placeholder;
      }

      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.queryOptions.enabled) {
          createQueryOptions({ operation, plugin, queryFn });
        }
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.mutationOptions.enabled) {
          createMutationOptions({ operation, plugin, queryFn });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
