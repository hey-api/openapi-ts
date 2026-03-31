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
        body: {
          case: plugin.config.case ?? 'camelCase',
          enabled: true,
          name: 'v{{name}}Body',
        },
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        headers: {
          case: plugin.config.case ?? 'camelCase',
          enabled: true,
          name: 'v{{name}}Headers',
        },
        name: 'v{{name}}Data',
        path: {
          case: plugin.config.case ?? 'camelCase',
          enabled: true,
          name: 'v{{name}}Path',
        },
        query: {
          case: plugin.config.case ?? 'camelCase',
          enabled: true,
          name: 'v{{name}}Query',
        },
        shouldExtract: () => false,
      },
      mappers: {
        ...mappers,
        object: (fields, defaultValue) => ({
          ...fields,
          body: context.valueToObject({
            defaultValue: defaultValue.body as Extract<
              typeof defaultValue.body,
              Record<string, unknown>
            >,
            mappers,
            value: fields.body,
          }),
          headers: context.valueToObject({
            defaultValue: defaultValue.headers as Extract<
              typeof defaultValue.headers,
              Record<string, unknown>
            >,
            mappers,
            value: fields.headers,
          }),
          path: context.valueToObject({
            defaultValue: defaultValue.path as Extract<
              typeof defaultValue.path,
              Record<string, unknown>
            >,
            mappers,
            value: fields.path,
          }),
          query: context.valueToObject({
            defaultValue: defaultValue.query as Extract<
              typeof defaultValue.query,
              Record<string, unknown>
            >,
            mappers,
            value: fields.query,
          }),
          shouldExtract:
            fields.shouldExtract !== undefined
              ? typeof fields.shouldExtract === 'function'
                ? fields.shouldExtract
                : () => Boolean(fields.shouldExtract)
              : defaultValue.shouldExtract,
        }),
      },
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
