import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import { piniaColadaSymbols } from './symbols';
import type { PiniaColadaPlugin } from './types';

const defaultMeta = (): Record<string, unknown> => ({});

export const defaultConfig: PiniaColadaPlugin['Config'] = {
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
    mutationOptions: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      meta: defaultMeta,
      name: '{{name}}Mutation',
    },
    queryKeys: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}QueryKey',
      tags: false,
    },
    queryOptions: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      meta: defaultMeta,
      name: '{{name}}Query',
    },
  },
  dependencies: ['@hey-api/typescript', '@hey-api/sdk'],
  handler,
  name: '@pinia/colada',
  symbolMeta() {
    return {
      tool: '@pinia/colada',
    };
  },
  symbols: piniaColadaSymbols,
};

/**
 * Type helper for `@pinia/colada` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
