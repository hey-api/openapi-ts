import { coerce, definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { ValibotPlugin } from './types';

export const defaultConfig: ValibotPlugin['Config'] = {
  api: new Api(),
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    comments: true,
    definitions: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: 'v{{name}}',
    },
    includeInEntry: false,
    metadata: false,
    requests: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      body: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'v{{name}}Body',
      },
      enabled: true,
      headers: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'v{{name}}Headers',
      },
      name: 'v{{name}}Data',
      path: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'v{{name}}Path',
      },
      query: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'v{{name}}Query',
      },
      shouldExtract: coerce((value) =>
        typeof value === 'function' ? value : () => Boolean(value),
      ),
    },
    responses: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: 'v{{name}}Response',
    },
    webhooks: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: 'v{{name}}WebhookRequest',
    },
  },
  handler,
  name: 'valibot',
  tags: ['transformer', 'validator'],
};

/**
 * Type helper for Valibot plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
