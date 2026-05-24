import { coerce, defineNormalizers, definePluginConfig, mappers } from '@hey-api/shared';
import colors from 'ansi-colors';

import { Api } from './api';
import { handler } from './plugin';
import type { ZodPlugin } from './types';

type CompatibilityVersion = NonNullable<ZodPlugin['Config']['config']['compatibilityVersion']>;

const normalizeConfig = defineNormalizers<
  ZodPlugin['Types']['resolvedConfig'],
  ZodPlugin['Config']['config']
>((c, context) => {
  const casing = c.case ?? 'camelCase';

  const types = context.valueToObject({
    defaultValue: {
      infer: { case: 'PascalCase', enabled: false },
      input: { case: 'PascalCase', enabled: false },
      output: { case: 'PascalCase', enabled: false },
    },
    // @ts-expect-error
    mappers,
    value: c.types,
  }) as ZodPlugin['Types']['resolvedConfig']['types'];

  return {
    dates: {
      local: false,
      offset: false,
    },
    definitions: {
      case: casing,
      enabled: true,
      name: 'z{{name}}',
      types: {
        infer: { ...types.infer, name: '{{name}}ZodType' },
        input: { ...types.input, name: '{{name}}ZodInput' },
        output: { ...types.output, name: '{{name}}ZodOutput' },
      },
    },
    requests: {
      body: {
        case: casing,
        enabled: true,
        name: 'z{{name}}Body',
        types: {
          infer: { ...types.infer, name: '{{name}}BodyZodType' },
          input: { ...types.input, name: '{{name}}BodyZodInput' },
          output: { ...types.output, name: '{{name}}BodyZodOutput' },
        },
      },
      case: casing,
      enabled: true,
      headers: {
        case: casing,
        enabled: true,
        name: 'z{{name}}Headers',
        types: {
          infer: { ...types.infer, name: '{{name}}HeadersZodType' },
          input: { ...types.input, name: '{{name}}HeadersZodInput' },
          output: { ...types.output, name: '{{name}}HeadersZodOutput' },
        },
      },
      name: 'z{{name}}Data',
      path: {
        case: casing,
        enabled: true,
        name: 'z{{name}}Path',
        types: {
          infer: { ...types.infer, name: '{{name}}PathZodType' },
          input: { ...types.input, name: '{{name}}PathZodInput' },
          output: { ...types.output, name: '{{name}}PathZodOutput' },
        },
      },
      query: {
        case: casing,
        enabled: true,
        name: 'z{{name}}Query',
        types: {
          infer: { ...types.infer, name: '{{name}}QueryZodType' },
          input: { ...types.input, name: '{{name}}QueryZodInput' },
          output: { ...types.output, name: '{{name}}QueryZodOutput' },
        },
      },
      shouldExtract: coerce((value) =>
        typeof value === 'function' ? value : () => Boolean(value),
      ),
      types: {
        infer: { ...types.infer, name: '{{name}}DataZodType' },
        input: { ...types.input, name: '{{name}}DataZodInput' },
        output: { ...types.output, name: '{{name}}DataZodOutput' },
      },
    },
    responses: {
      case: casing,
      enabled: true,
      name: 'z{{name}}Response',
      types: {
        infer: { ...types.infer, name: '{{name}}ResponseZodType' },
        input: { ...types.input, name: '{{name}}ResponseZodInput' },
        output: { ...types.output, name: '{{name}}ResponseZodOutput' },
      },
    },
    types: {
      infer: {
        case: 'PascalCase',
        enabled: false,
      },
      input: {
        case: 'PascalCase',
        enabled: false,
      },
      output: {
        case: 'PascalCase',
        enabled: false,
      },
    },
    webhooks: {
      case: casing,
      enabled: true,
      name: 'z{{name}}WebhookRequest',
      types: {
        infer: { ...types.infer, name: '{{name}}WebhookRequestZodType' },
        input: { ...types.input, name: '{{name}}WebhookRequestZodInput' },
        output: { ...types.output, name: '{{name}}WebhookRequestZodOutput' },
      },
    },
  };
});

export const defaultConfig: ZodPlugin['Config'] = {
  api: new Api(),
  config: {
    case: 'camelCase',
    comments: true,
    includeInEntry: false,
    metadata: false,
  },
  handler,
  name: 'zod',
  resolveConfig: (plugin, context) => {
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

    normalizeConfig(plugin.config, context);
  },
  tags: ['transformer', 'validator'],
};

/**
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
