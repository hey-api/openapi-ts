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
      enabled: true,
      name: '{{name}}',
      types: {
        infer: { name: '{{name}}' },
      },
    },
    includeInEntry: false,
    metadata: false,
    requests: {
      enabled: true,
      name: '{{name}}Data',
      types: {
        infer: { name: '{{name}}Data' },
      },
    },
    responses: {
      enabled: true,
      name: '{{name}}Response',
      types: {
        infer: { name: '{{name}}Response' },
      },
    },
    types: {
      infer: {
        case: 'PascalCase',
        enabled: false,
      },
    },
    webhooks: {
      enabled: true,
      name: '{{name}}WebhookRequest',
      types: {
        infer: { name: '{{name}}WebhookRequest' },
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
