import { definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { ArktypePlugin } from './types';

export const defaultConfig: ArktypePlugin['Config'] = {
  api: new Api(),
  config: {
    $cascade: ['case', 'types'],
    case: 'PascalCase',
    comments: true,
    definitions: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}',
      types: {
        infer: {
          $coerceAny: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}',
        },
      },
    },
    includeInEntry: false,
    metadata: false,
    requests: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}Data',
      types: {
        infer: {
          $coerceAny: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}Data',
        },
      },
    },
    responses: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}Response',
      types: {
        infer: {
          $coerceAny: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}Response',
        },
      },
    },
    types: {
      infer: {
        $coerceAny: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        case: 'PascalCase',
        enabled: false,
      },
    },
    webhooks: {
      $coerceAny: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}WebhookRequest',
      types: {
        infer: {
          $coerceAny: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}WebhookRequest',
        },
      },
    },
  },
  handler,
  name: 'arktype',
  tags: ['validator'],
};

/**
 * Type helper for Arktype plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
