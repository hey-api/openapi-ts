import { definePluginConfig, mappers } from '@hey-api/shared';

import { handler } from './plugin';
import type { PydanticPlugin } from './types';

export const defaultConfig: PydanticPlugin['Config'] = {
  config: {
    case: 'PascalCase',
    comments: true,
    enums: 'enum',
    includeInEntry: false,
    strict: false,
  },
  handler,
  name: 'pydantic',
  resolveConfig: (plugin, context) => {
    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}',
      },
      mappers,
      value: plugin.config.definitions,
    });

    plugin.config.requests = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}Request',
      },
      mappers,
      value: plugin.config.requests,
    });

    plugin.config.responses = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}Response',
      },
      mappers,
      value: plugin.config.responses,
    });

    plugin.config.webhooks = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}Webhook',
      },
      mappers,
      value: plugin.config.webhooks,
    });
  },
  tags: ['validator'],
};

/**
 * Type helper for Pydantic plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
