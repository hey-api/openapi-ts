import { definePluginConfig } from '@hey-api/shared';

import { handler } from './plugin';
import type { PydanticPlugin } from './types';

export const defaultConfig: PydanticPlugin['Config'] = {
  config: {
    $cascade: ['case'],
    case: 'PascalCase',
    comments: true,
    definitions: {
      enabled: true,
      name: '{{name}}',
    },
    enums: 'enum',
    fieldStyle: 'field',
    includeInEntry: false,
    modelType: 'BaseModel',
    requests: {
      enabled: true,
      name: '{{name}}Request',
    },
    responses: {
      enabled: true,
      name: '{{name}}Response',
    },
    strict: false,
    webhooks: {
      enabled: true,
      name: '{{name}}Webhook',
    },
  },
  handler,
  name: 'pydantic',
  tags: ['validator'],
};

/**
 * Type helper for Pydantic plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
