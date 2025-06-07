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

export const handler: PluginHandler = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
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

  context.subscribe('before', () => {
    file.import({
      ...clientApi.Options,
      module: file.relativePathToFile({ context, id: sdkId }),
    });
  });

  context.subscribe('operation', ({ operation }) => {
    state.hasUsedQueryFn = false;

    const sdk = context.config.plugins['@hey-api/sdk'];
    const classes = sdk?.asClass
      ? operationClasses({ context, operation, plugin: sdk })
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
                config: context.config,
                handleIllegal: true,
                id: operation.id,
                operation,
              }),
            ]
      ).join('.');

    createQueryOptions({
      context,
      operation,
      plugin,
      queryFn,
      state,
    });

    createInfiniteQueryOptions({
      context,
      operation,
      plugin,
      queryFn,
      state,
    });

    createMutationOptions({
      context,
      operation,
      plugin,
      queryFn,
      state,
    });

    if (state.hasUsedQueryFn) {
      file.import({
        module: file.relativePathToFile({ context, id: sdkId }),
        name: queryFn.split('.')[0]!,
      });
    }
  });

  context.subscribe('after', () => {
    if (state.hasQueries || state.hasInfiniteQueries) {
      file.import({
        alias: '_heyApiClient',
        module: file.relativePathToFile({ context, id: clientId }),
        name: 'client',
      });
    }
  });
};
