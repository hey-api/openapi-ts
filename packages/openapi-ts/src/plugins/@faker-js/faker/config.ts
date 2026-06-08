import { definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
// import { handler } from './plugin';
import type { FakerJsFakerPlugin } from './types';

export const defaultConfig: FakerJsFakerPlugin['Config'] = {
  api: new Api(),
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    definitions: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: 'v{{name}}',
    },
    includeInEntry: false,
  },
  // handler,
  handler: () => {},
  name: '@faker-js/faker',
  tags: ['mocker'],
};

/**
 * Type helper for Faker plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
