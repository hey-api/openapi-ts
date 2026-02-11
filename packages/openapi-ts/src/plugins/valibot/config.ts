import { definePluginConfig, mappers } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { ValibotPlugin } from './types';

export const defaultConfig: ValibotPlugin['Config'] = {
  api: new Api(),
  config: {
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
    metadata: false,
  },
  handler,
  name: 'valibot',
  resolveConfig: (plugin, context) => {
    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'v{{name}}',
      },
      mappers,
      value: plugin.config.definitions,
    });

    plugin.config.requests = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'v{{name}}Data',
      },
      mappers,
      value: plugin.config.requests,
    });

    plugin.config.responses = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'v{{name}}Response',
      },
      mappers,
      value: plugin.config.responses,
    });

    plugin.config.webhooks = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'v{{name}}WebhookRequest',
      },
      mappers,
      value: plugin.config.webhooks,
    });
  },
  tags: ['validator'],
};

/**
 * Type helper for Valibot plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
