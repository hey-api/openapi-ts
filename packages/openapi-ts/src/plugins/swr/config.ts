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
  handler: handler as SwrPlugin['Handler'],
  name: 'swr',
  resolveConfig: (plugin, context) => {
    // Resolve swrKeys configuration
    plugin.config.swrKeys = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        exported: true,
        name: '{{name}}Key',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.swrKeys,
    });

    // Resolve swrOptions configuration
    plugin.config.swrOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        exported: true,
        name: '{{name}}Options',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.swrOptions,
    });

    // Resolve swrMutationOptions configuration
    plugin.config.swrMutationOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        exported: true,
        name: '{{name}}Mutation',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.swrMutationOptions,
    });

    // Resolve swrInfiniteOptions configuration
    plugin.config.swrInfiniteOptions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        exported: true,
        name: '{{name}}Infinite',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.swrInfiniteOptions,
    });
  },
};

/**
 * Type helper for `swr` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
