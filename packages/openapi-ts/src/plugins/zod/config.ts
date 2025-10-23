import colors from 'ansi-colors';

import { definePluginConfig, mappers } from '~/plugins/shared/utils/config';

import { Api } from './api';
import { handler } from './plugin';
import type { ZodPlugin } from './types';

type CompatibilityVersion = NonNullable<
  ZodPlugin['Config']['config']['compatibilityVersion']
>;

export const defaultConfig: ZodPlugin['Config'] = {
  api: new Api({
    name: 'zod',
  }),
  config: {
    case: 'camelCase',
    comments: true,
    exportFromIndex: false,
    metadata: false,
  },
  handler,
  name: 'zod',
  resolveConfig: (plugin, context) => {
    const packageName = 'zod';
    const version = context.package.getVersion(packageName);

    const inferCompatibleVersion = (): CompatibilityVersion => {
      if (version && (version.major === 4 || version.major === 3)) {
        return version.major;
      }

      // default compatibility version
      return 4;
    };

    const ensureCompatibleVersion = (
      compatibilityVersion: CompatibilityVersion | undefined,
    ): CompatibilityVersion => {
      if (!compatibilityVersion) {
        return inferCompatibleVersion();
      }

      if (!version) {
        return compatibilityVersion;
      }

      if (
        compatibilityVersion === 4 ||
        compatibilityVersion === 3 ||
        compatibilityVersion === 'mini'
      ) {
        if (!context.package.satisfies(version, '>=3.25.0 <5.0.0')) {
          const compatibleVersion = inferCompatibleVersion();
          console.warn(
            `🔌 ${colors.yellow('Warning:')} Installed ${colors.cyan(packageName)} ${colors.cyan(`v${version.version}`)} does not support compatibility version ${colors.yellow(String(compatibilityVersion))}, using ${colors.yellow(String(compatibleVersion))}.`,
          );
          return compatibleVersion;
        }
      }

      return compatibilityVersion;
    };

    plugin.config.compatibilityVersion = ensureCompatibleVersion(
      plugin.config.compatibilityVersion,
    );

    plugin.config.dates = context.valueToObject({
      defaultValue: {
        local: false,
        offset: false,
      },
      value: plugin.config.dates,
    });

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
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'z{{name}}',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}ZodType',
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
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'z{{name}}Data',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}DataZodType',
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
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'z{{name}}Response',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}ResponseZodType',
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
        case: plugin.config.case ?? 'camelCase',
        enabled: true,
        name: 'z{{name}}WebhookRequest',
        types: {
          ...plugin.config.types,
          infer: {
            ...(plugin.config.types.infer as Extract<
              typeof plugin.config.types.infer,
              Record<string, unknown>
            >),
            name: '{{name}}WebhookRequestZodType',
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
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
