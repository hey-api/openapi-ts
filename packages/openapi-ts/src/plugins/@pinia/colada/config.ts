import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { PiniaColadaPlugin } from './types';

const defaultMeta = (): Record<string, unknown> => ({});

export const defaultConfig: PiniaColadaPlugin['Config'] = {
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
    mutationOptions: {
      enabled: true,
      meta: defaultMeta,
      name: '{{name}}Mutation',
    },
    queryKeys: {
      enabled: true,
      name: '{{name}}QueryKey',
      tags: false,
    },
    queryOptions: {
      enabled: true,
      meta: defaultMeta,
      name: '{{name}}Query',
    },
  },
  dependencies: ['@hey-api/typescript', '@hey-api/sdk'],
  handler,
  name: '@pinia/colada',
};

/**
 * Type helper for `@pinia/colada` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
