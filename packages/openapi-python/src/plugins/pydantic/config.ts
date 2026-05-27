import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import { pydanticSymbols } from './symbols';
import type { PydanticPlugin } from './types';

export const defaultConfig: PydanticPlugin['Config'] = {
  config: {
    $cascade: ['case'],
    case: 'PascalCase',
    comments: true,
    definitions: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}',
    },
    enums: 'enum',
    fieldStyle: 'field',
    includeInEntry: false,
    modelType: 'BaseModel',
    requests: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}Request',
    },
    responses: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}Response',
    },
    strict: false,
    webhooks: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: '{{name}}Webhook',
    },
  },
  handler,
  name: 'pydantic',
  symbols: pydanticSymbols,
  tags: ['validator'],
};

/**
 * Type helper for Pydantic plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
