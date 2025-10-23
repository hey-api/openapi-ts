import { definePluginConfig, mappers } from '~/plugins/shared/utils/config';

import { Api } from './api';
import { handler } from './plugin';
import type { ArktypePlugin } from './types';

export const defaultConfig: ArktypePlugin['Config'] = {
  api: new Api({
    name: 'arktype',
  }),
  config: {
    case: 'PascalCase',
    comments: true,
    exportFromIndex: false,
    metadata: false,
  },
  handler,
  name: 'arktype',
  resolveConfig: (plugin, context) => {
    plugin.config.types = context.valueToObject({
      defaultValue: {
        infer: {
          case: 'PascalCase',
          enabled: false,
        },
      },
      mappers: {
        object: (fields, defaultValue) => ({
          ...fields,
          infer: context.valueToObject({
            defaultValue: {
              ...(defaultValue.infer as Extract<
                typeof defaultValue.infer,
                Record<string, unknown>
              >),
              enabled:
                fields.infer !== undefined
                  ? Boolean(fields.infer)
                  : (
                      defaultValue.infer as Extract<
                        typeof defaultValue.infer,
                        Record<string, unknown>
                      >
                    ).enabled,
            },
            mappers,
            value: fields.infer,
          }),
        }),
      },
      value: plugin.config.types,
    });

    plugin.config.definitions = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}',
          },
        },
      },
      mappers: {
        ...mappers,
        object: (fields, defaultValue) => ({
          ...fields,
          types: context.valueToObject({
            defaultValue: defaultValue.types!,
            mappers: {
              object: (fields, defaultValue) => ({
                ...fields,
                infer: context.valueToObject({
                  defaultValue: {
                    ...(defaultValue.infer as Extract<
                      typeof defaultValue.infer,
                      Record<string, unknown>
                    >),
                    enabled:
                      fields.infer !== undefined
                        ? Boolean(fields.infer)
                        : (
                            defaultValue.infer as Extract<
                              typeof defaultValue.infer,
                              Record<string, unknown>
                            >
                          ).enabled,
                  },
                  mappers,
                  value: fields.infer,
                }),
              }),
            },
            value: fields.types,
          }),
        }),
      },
      value: plugin.config.definitions,
    });

    plugin.config.requests = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}Data',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}Data',
          },
        },
      },
      mappers: {
        ...mappers,
        object: (fields, defaultValue) => ({
          ...fields,
          types: context.valueToObject({
            defaultValue: defaultValue.types!,
            mappers: {
              object: (fields, defaultValue) => ({
                ...fields,
                infer: context.valueToObject({
                  defaultValue: {
                    ...(defaultValue.infer as Extract<
                      typeof defaultValue.infer,
                      Record<string, unknown>
                    >),
                    enabled:
                      fields.infer !== undefined
                        ? Boolean(fields.infer)
                        : (
                            defaultValue.infer as Extract<
                              typeof defaultValue.infer,
                              Record<string, unknown>
                            >
                          ).enabled,
                  },
                  mappers,
                  value: fields.infer,
                }),
              }),
            },
            value: fields.types,
          }),
        }),
      },
      value: plugin.config.requests,
    });

    plugin.config.responses = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}Response',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}Response',
          },
        },
      },
      mappers: {
        ...mappers,
        object: (fields, defaultValue) => ({
          ...fields,
          types: context.valueToObject({
            defaultValue: defaultValue.types!,
            mappers: {
              object: (fields, defaultValue) => ({
                ...fields,
                infer: context.valueToObject({
                  defaultValue: {
                    ...(defaultValue.infer as Extract<
                      typeof defaultValue.infer,
                      Record<string, unknown>
                    >),
                    enabled:
                      fields.infer !== undefined
                        ? Boolean(fields.infer)
                        : (
                            defaultValue.infer as Extract<
                              typeof defaultValue.infer,
                              Record<string, unknown>
                            >
                          ).enabled,
                  },
                  mappers,
                  value: fields.infer,
                }),
              }),
            },
            value: fields.types,
          }),
        }),
      },
      value: plugin.config.responses,
    });

    plugin.config.webhooks = context.valueToObject({
      defaultValue: {
        case: plugin.config.case ?? 'PascalCase',
        enabled: true,
        name: '{{name}}WebhookRequest',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}WebhookRequest',
          },
        },
      },
      mappers: {
        ...mappers,
        object: (fields, defaultValue) => ({
          ...fields,
          types: context.valueToObject({
            defaultValue: defaultValue.types!,
            mappers: {
              object: (fields, defaultValue) => ({
                ...fields,
                infer: context.valueToObject({
                  defaultValue: {
                    ...(defaultValue.infer as Extract<
                      typeof defaultValue.infer,
                      Record<string, unknown>
                    >),
                    enabled:
                      fields.infer !== undefined
                        ? Boolean(fields.infer)
                        : (
                            defaultValue.infer as Extract<
                              typeof defaultValue.infer,
                              Record<string, unknown>
                            >
                          ).enabled,
                  },
                  mappers,
                  value: fields.infer,
                }),
              }),
            },
            value: fields.types,
          }),
        }),
      },
      value: plugin.config.webhooks,
    });
  },
  tags: ['validator'],
};

/**
 * Type helper for Arktype plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
