import { stringCase } from '../../../utils/stringCase';
import { operationClasses } from '../../@hey-api/sdk/operation';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import type { PluginHandler } from './types';
import { createUseQuery } from './useQuery';

export const handler: PluginHandler = ({ plugin }) => {
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      kind: 'type',
    },
    name: 'DefaultError',
    selector: plugin.api.selector('DefaultError'),
  });
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      kind: 'type',
    },
    name: 'InfiniteData',
    selector: plugin.api.selector('InfiniteData'),
  });
  const mutationsType =
    plugin.name === '@tanstack/angular-query-experimental' ||
    plugin.name === '@tanstack/svelte-query' ||
    plugin.name === '@tanstack/solid-query'
      ? 'MutationOptions'
      : 'UseMutationOptions';
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      kind: 'type',
    },
    name: mutationsType,
    selector: plugin.api.selector('MutationOptions'),
  });
  plugin.registerSymbol({
    external: plugin.name,
    name: 'infiniteQueryOptions',
    selector: plugin.api.selector('infiniteQueryOptions'),
  });
  plugin.registerSymbol({
    external: plugin.name,
    name: 'queryOptions',
    selector: plugin.api.selector('queryOptions'),
  });
  plugin.registerSymbol({
    external: plugin.name,
    name: 'useQuery',
    selector: plugin.api.selector('useQuery'),
  });
  plugin.registerSymbol({
    external: 'axios',
    meta: {
      kind: 'type',
    },
    name: 'AxiosError',
    selector: plugin.api.selector('AxiosError'),
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
              plugin.referenceSymbol(
                sdkPlugin.api.selector('class', entry.path[0]),
              ).placeholder,
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
          : plugin.referenceSymbol(
              sdkPlugin.api.selector('function', operation.id),
            ).placeholder;

      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.queryOptions.enabled) {
          createQueryOptions({ operation, plugin, queryFn });
        }

        if (plugin.config.infiniteQueryOptions.enabled) {
          createInfiniteQueryOptions({ operation, plugin, queryFn });
        }

        if ('useQuery' in plugin.config && plugin.config.useQuery.enabled) {
          createUseQuery({ operation, plugin });
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
