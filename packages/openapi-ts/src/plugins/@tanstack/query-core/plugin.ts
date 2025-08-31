import { clientApi } from '../../../generate/client';
import { stringCase } from '../../../utils/stringCase';
import { clientId } from '../../@hey-api/client-core/utils';
import { sdkId } from '../../@hey-api/sdk/constants';
import { operationClasses } from '../../@hey-api/sdk/operation';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import type { PluginHandler, PluginState } from './types';
import { createUseQuery } from './useQuery';

export const handler = ({ plugin }: Parameters<PluginHandler>[0]) => {
  const file = plugin.createFile({
    case: plugin.config.case,
    id: plugin.name,
    path: plugin.output,
  });

  const state: PluginState = {
    hasCreateInfiniteParamsFunction: false,
    hasCreateQueryKeyParamsFunction: false,
    hasInfiniteQueries: false,
    hasMutations: false,
    hasQueries: false,
    hasUsedQueryFn: false,
    typeInfiniteData: undefined!,
  };

  file.import({
    ...clientApi.Options,
    module: file.relativePathToFile({ context: plugin.context, id: sdkId }),
  });

  plugin.forEach('operation', ({ operation }) => {
    state.hasUsedQueryFn = false;

    const sdkPlugin = plugin.getPlugin('@hey-api/sdk');
    const classes = sdkPlugin?.config.asClass
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
      (
        entry
          ? [
              entry.path[0],
              ...entry.path.slice(1).map((className) =>
                stringCase({
                  case: 'camelCase',
                  value: className,
                }),
              ),
              entry.methodName,
            ].filter(Boolean)
          : [
              serviceFunctionIdentifier({
                config: plugin.context.config,
                handleIllegal: true,
                id: operation.id,
                operation,
              }),
            ]
      ).join('.');

    if (plugin.hooks.operation.isQuery(operation)) {
      if (plugin.config.queryOptions.enabled) {
        createQueryOptions({
          operation,
          plugin,
          queryFn,
          state,
        });
      }

      if (plugin.config.infiniteQueryOptions.enabled) {
        createInfiniteQueryOptions({
          operation,
          plugin,
          queryFn,
          state,
        });
      }

      if ('useQuery' in plugin.config && plugin.config.useQuery.enabled) {
        createUseQuery({ operation, plugin, state });
      }
    }

    if (plugin.hooks.operation.isMutation(operation)) {
      if (plugin.config.mutationOptions.enabled) {
        createMutationOptions({
          operation,
          plugin,
          queryFn,
          state,
        });
      }
    }

    if (state.hasUsedQueryFn) {
      file.import({
        module: file.relativePathToFile({ context: plugin.context, id: sdkId }),
        name: queryFn.split('.')[0]!,
      });
    }
  });

  if (state.hasQueries || state.hasInfiniteQueries) {
    file.import({
      alias: '_heyApiClient',
      module: file.relativePathToFile({
        context: plugin.context,
        id: clientId,
      }),
      name: 'client',
    });
  }
};
