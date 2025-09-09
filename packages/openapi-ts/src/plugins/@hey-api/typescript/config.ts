import { definePluginConfig } from '../../shared/utils/config';
import { Api } from './api';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiTypeScriptPlugin } from './types';

export const defaultConfig: HeyApiTypeScriptPlugin['Config'] = {
  api: new Api({
    name: '@hey-api/typescript',
  }),
  config: {
    case: 'PascalCase',
    exportFromIndex: true,
    style: 'preserve',
    tree: false,
  },
  handler,
  handlerLegacy,
  name: '@hey-api/typescript',
  output: 'types',
  resolveConfig: (plugin, context) => {
    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        name: '{{name}}',
      },
      mappers: {
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.definitions,
    });

    plugin.config.enums = context.valueToObject({
      defaultValue: {
        case: 'SCREAMING_SNAKE_CASE',
        constantsIgnoreNull: false,
        enabled: Boolean(plugin.config.enums),
        mode: 'javascript',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (mode) => ({ mode }),
      },
      value: plugin.config.enums,
    });

    plugin.config.errors = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        error: '{{name}}Error',
        name: '{{name}}Errors',
      },
      mappers: {
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.errors,
    });

    plugin.config.requests = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        name: '{{name}}Data',
      },
      mappers: {
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.requests,
    });

    plugin.config.responses = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        name: '{{name}}Responses',
        response: '{{name}}Response',
      },
      mappers: {
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.responses,
    });

    plugin.config.webhooks = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        name: '{{name}}WebhookRequest',
        payload: '{{name}}WebhookPayload',
      },
      mappers: {
        function: (name) => ({ name }),
        string: (name) => ({ name }),
      },
      value: plugin.config.webhooks,
    });
  },
};

/**
 * Type helper for `@hey-api/typescript` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
