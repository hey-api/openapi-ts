import { definePluginConfig } from '../shared/utils/config';
import { api } from './api';
import { handler } from './plugin';
import type { ZodPlugin } from './types';

export const defaultConfig: ZodPlugin['Config'] = {
  api,
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
    metadata: false,
  },
  handler,
  name: 'zod',
  output: 'zod',
  resolveConfig: (plugin, context) => {
    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'z{{name}}',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.definitions,
    });

    plugin.config.requests = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'z{{name}}Data',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.requests,
    });

    plugin.config.responses = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'z{{name}}Response',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (name) => ({ enabled: true, name }),
      },
      value: plugin.config.responses,
    });
  },
  tags: ['validator'],
};

/**
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
