import { clientApi, clientModulePath } from '../../../generate/client';
import { getServiceName } from '../../../utils/postprocess';
import { transformServiceName } from '../../../utils/transform';
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
      module: clientModulePath({
        config: context.config,
        sourceOutput: plugin.output,
      }),
    });
  });

  context.subscribe('operation', ({ operation }) => {
    state.hasUsedQueryFn = false;

    const queryFn = [
      context.config.plugins['@hey-api/sdk']?.asClass &&
        transformServiceName({
          config: context.config,
          name: getServiceName(operation.tags?.[0] || 'default'),
        }),
      serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: !context.config.plugins['@hey-api/sdk']?.asClass,
        id: operation.id,
        operation,
      }),
    ]
      .filter(Boolean)
      .join('.');

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
        module: file.relativePathToFile({ context, id: 'sdk' }),
        name: queryFn.split('.')[0]!,
      });
    }
  });

  context.subscribe('after', () => {
    if (state.hasQueries || state.hasInfiniteQueries) {
      file.import({
        module: file.relativePathToFile({ context, id: 'sdk' }),
        name: 'client',
      });
    }
  });
};
