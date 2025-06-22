import { definePluginConfig } from '../shared/utils/config';
import type { Plugin } from '../types';
import { handler } from './plugin';
import type { Config, ResolvedConfig } from './types';

export const defaultConfig: Plugin.Config<Config, ResolvedConfig> = {
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
    metadata: false,
  },
  handler,
  handlerLegacy: () => {},
  name: 'valibot',
  output: 'valibot',
  resolveConfig: (plugin, context) => {
    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'v{{name}}',
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
        name: 'v{{name}}Data',
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
        name: 'v{{name}}Response',
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
 * Type helper for Valibot plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
