import { definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
// import { handler } from './plugin';
import type { FakerJsFakerPlugin } from './types';

export const defaultConfig: FakerJsFakerPlugin['Config'] = {
  api: new Api(),
  config: {
    case: 'camelCase',
    includeInEntry: false,
  },
  // handler,
  handler: () => {},
  name: '@faker-js/faker',
  resolveConfig: (plugin, context) => {
    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'v{{name}}',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.definitions,
    });
  },
  tags: ['mocker'],
};

/**
 * Type helper for Faker plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
