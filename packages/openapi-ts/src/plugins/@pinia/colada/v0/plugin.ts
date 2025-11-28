import { registryName } from '~/plugins/@hey-api/sdk/shared/class';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { $ } from '~/ts-dsl';
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
