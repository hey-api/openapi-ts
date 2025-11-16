import { definePluginConfig } from '~/plugins/shared/utils/config';

import { handler } from './plugin';
import type { SwrPlugin } from './types';

export const defaultConfig: SwrPlugin['Config'] = {
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler,
  name: 'swr',
  resolveConfig: (plugin, context) => {
    plugin.config.swrInfiniteOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Infinite',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.swrInfiniteOptions,
    });

    plugin.config.swrKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Key',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.swrKeys,
    });

    plugin.config.swrMutationOptions = context.valueToObject({
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
      value: plugin.config.swrMutationOptions,
    });

    plugin.config.swrOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: '{{name}}Options',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.swrOptions,
    });
  },
};

/**
 * Type helper for `swr` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
