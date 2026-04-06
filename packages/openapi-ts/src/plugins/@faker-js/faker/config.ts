import { definePluginConfig, mappers } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { FakerJsFakerPlugin } from './types';

export const defaultConfig: FakerJsFakerPlugin['Config'] = {
  api: new Api(),
  config: {
    case: 'camelCase',
    includeInEntry: false,
    nameRules: {},
  },
  handler,
  name: '@faker-js/faker',
  resolveConfig: (plugin, context) => {
    if (!plugin.config.compatibilityVersion) {
      const version = context.package.getVersion('@faker-js/faker');
      plugin.config.compatibilityVersion =
        version && (version.major === 9 || version.major === 10) ? (version.major as 9 | 10) : 9;
    }

    plugin.config.maxCallDepth = plugin.config.maxCallDepth ?? 10;

    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'fake{{name}}',
      },
      mappers,
      value: plugin.config.definitions,
    });

    plugin.config.requests = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'fake{{name}}Request',
      },
      mappers,
      value: plugin.config.requests,
    });

    plugin.config.responses = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'fake{{name}}Response',
      },
      mappers,
      value: plugin.config.responses,
    });
  },
  tags: ['mocker'],
};

/**
 * Type helper for Faker plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
