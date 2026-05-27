import { coerce, definePluginConfig } from '@hey-api/shared';
import colors from 'ansi-colors';

import { Api } from './api';
import { handler } from './plugin';
import { zodSymbols } from './symbols';
import type { ZodPlugin } from './types';

type CompatibilityVersion = NonNullable<ZodPlugin['Types']['config']['compatibilityVersion']>;

export const defaultConfig: ZodPlugin['Config'] = {
  api: new Api(),
  config: {
    $cascade: ['case', 'types'],
    case: 'camelCase',
    comments: true,
    dates: {
      local: false,
      offset: false,
    },
    definitions: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: 'z{{name}}',
      types: {
        infer: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}ZodType',
        },
        input: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}ZodInput',
        },
        output: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}ZodOutput',
        },
      },
    },
    includeInEntry: false,
    metadata: false,
    requests: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      body: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'z{{name}}Body',
        types: {
          infer: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}BodyZodType',
          },
          input: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}BodyZodInput',
          },
          output: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}BodyZodOutput',
          },
        },
      },
      enabled: true,
      headers: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'z{{name}}Headers',
        types: {
          infer: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}HeadersZodType',
          },
          input: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}HeadersZodInput',
          },
          output: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}HeadersZodOutput',
          },
        },
      },
      name: 'z{{name}}Data',
      path: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'z{{name}}Path',
        types: {
          infer: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}PathZodType',
          },
          input: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}PathZodInput',
          },
          output: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}PathZodOutput',
          },
        },
      },
      query: {
        $onCoerce: ({ type, value }) => ({
          enabled: Boolean(value),
          ...(type === 'string' || type === 'function' ? { name: value } : {}),
        }),
        enabled: true,
        name: 'z{{name}}Query',
        types: {
          infer: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}QueryZodType',
          },
          input: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}QueryZodInput',
          },
          output: {
            $onCoerce: ({ type, value }) => ({
              enabled: Boolean(value),
              ...(type === 'string' || type === 'function' ? { name: value } : {}),
            }),
            name: '{{name}}QueryZodOutput',
          },
        },
      },
      shouldExtract: coerce((value) =>
        typeof value === 'function' ? value : () => Boolean(value),
      ),
      types: {
        infer: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}DataZodType',
        },
        input: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}DataZodInput',
        },
        output: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}DataZodOutput',
        },
      },
    },
    responses: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: 'z{{name}}Response',
      types: {
        infer: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}ResponseZodType',
        },
        input: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}ResponseZodInput',
        },
        output: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}ResponseZodOutput',
        },
      },
    },
    types: {
      infer: {
        $onCoerce: ({ value }) => ({ enabled: Boolean(value) }),
        case: 'PascalCase',
        enabled: false,
      },
      input: {
        $onCoerce: ({ value }) => ({ enabled: Boolean(value) }),
        case: 'PascalCase',
        enabled: false,
      },
      output: {
        $onCoerce: ({ value }) => ({ enabled: Boolean(value) }),
        case: 'PascalCase',
        enabled: false,
      },
    },
    webhooks: {
      $onCoerce: ({ type, value }) => ({
        enabled: Boolean(value),
        ...(type === 'string' || type === 'function' ? { name: value } : {}),
      }),
      enabled: true,
      name: 'z{{name}}WebhookRequest',
      types: {
        infer: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}WebhookRequestZodType',
        },
        input: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}WebhookRequestZodInput',
        },
        output: {
          $onCoerce: ({ type, value }) => ({
            enabled: Boolean(value),
            ...(type === 'string' || type === 'function' ? { name: value } : {}),
          }),
          name: '{{name}}WebhookRequestZodOutput',
        },
      },
    },
  },
  handler,
  name: 'zod',
  resolveConfig(plugin, context) {
    const packageName = 'zod';
    const version = context.package.getVersion(packageName);

    function inferCompatibleVersion(): CompatibilityVersion {
      if (version && (version.major === 4 || version.major === 3)) {
        return version.major;
      }

      // default compatibility version
      return 4;
    }

    function ensureCompatibleVersion(
      compatibilityVersion: CompatibilityVersion | undefined,
    ): CompatibilityVersion {
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
    }

    plugin.config.compatibilityVersion = ensureCompatibleVersion(
      plugin.config.compatibilityVersion,
    );
  },
  symbols: zodSymbols,
  tags: ['transformer', 'validator'],
};

/**
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
