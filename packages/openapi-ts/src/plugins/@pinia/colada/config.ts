import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import { handler } from './plugin';
import type { PiniaColadaPlugin } from './types';

export const defaultConfig: PiniaColadaPlugin['Config'] = {
  api: new Api(),
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/typescript', '@hey-api/sdk'],
  handler: handler as PiniaColadaPlugin['Handler'],
  name: '@pinia/colada',
  resolveConfig: (plugin, context) => {
    plugin.config.mutationOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Mutation',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.mutationOptions,
    });

    plugin.config.queryKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}QueryKey',
        tags: false,
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.queryKeys,
    });

    plugin.config.queryOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Query',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.queryOptions,
    });
  },
};

/**
 * Type helper for `@pinia/colada` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
