import { definePluginConfig } from '../../shared/utils/config';
import { handler } from './plugin';
import type { PiniaColadaPlugin } from './types';

export const defaultConfig: PiniaColadaPlugin['Config'] = {
  config: {
    autoDetectHttpMethod: true,
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
    groupByTag: false,
    operationTypes: {},
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler: handler as PiniaColadaPlugin['Handler'],
  name: '@pinia/colada',
  output: '@pinia/colada',
  resolveConfig: (plugin, context) => {
    plugin.config.mutationOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        meta: false,
        name: '{{name}}Mutation',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.mutationOptions,
    });

    plugin.config.queryOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        meta: false,
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
