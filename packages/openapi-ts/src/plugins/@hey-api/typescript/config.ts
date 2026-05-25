import { definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { HeyApiTypeScriptPlugin } from './types';

export const defaultConfig: HeyApiTypeScriptPlugin['Config'] = {
  api: new Api(),
  config: (c) => ({
    $cascade: ['case'],
    case: 'PascalCase',
    comments: true,
    definitions: {
      name: '{{name}}',
    },
    enums: {
      case: 'SCREAMING_SNAKE_CASE',
      constantsIgnoreNull: false,
      enabled: Boolean(c.enums),
      mode: typeof c.enums === 'string' ? c.enums : 'javascript',
    },
    errors: {
      error: '{{name}}Error',
      name: '{{name}}Errors',
    },
    includeInEntry: true,
    requests: {
      name: '{{name}}Data',
    },
    responses: {
      name: '{{name}}Responses',
      response: '{{name}}Response',
    },
    topType: 'unknown',
    webhooks: {
      name: '{{name}}WebhookRequest',
      payload: '{{name}}WebhookPayload',
    },
  }),
  handler,
  name: '@hey-api/typescript',
};

/**
 * Type helper for `@hey-api/typescript` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
