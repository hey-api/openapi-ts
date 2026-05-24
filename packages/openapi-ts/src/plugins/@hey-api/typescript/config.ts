import { defineNormalizers, definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { HeyApiTypeScriptPlugin } from './types';

const normalizeConfig = defineNormalizers<
  HeyApiTypeScriptPlugin['Types']['resolvedConfig'],
  HeyApiTypeScriptPlugin['Config']['config']
>((c) => {
  const casing = c.case ?? 'PascalCase';
  return {
    definitions: {
      case: casing,
      name: '{{name}}',
    },
    enums: {
      case: 'SCREAMING_SNAKE_CASE',
      constantsIgnoreNull: false,
      enabled: Boolean(c.enums),
      mode: typeof c.enums === 'string' ? c.enums : 'javascript',
    },
    errors: {
      case: casing,
      error: '{{name}}Error',
      name: '{{name}}Errors',
    },
    requests: {
      case: casing,
      name: '{{name}}Data',
    },
    responses: {
      case: casing,
      name: '{{name}}Responses',
      response: '{{name}}Response',
    },
    webhooks: {
      case: casing,
      name: '{{name}}WebhookRequest',
      payload: '{{name}}WebhookPayload',
    },
  };
});

export const defaultConfig: HeyApiTypeScriptPlugin['Config'] = {
  api: new Api(),
  config: {
    case: 'PascalCase',
    comments: true,
    includeInEntry: true,
    topType: 'unknown',
  },
  handler,
  name: '@hey-api/typescript',
  resolveConfig: (plugin, context) => {
    normalizeConfig(plugin.config, context);
  },
};

/**
 * Type helper for `@hey-api/typescript` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
