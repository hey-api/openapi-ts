import { coerce, definePluginConfig } from '@hey-api/shared';
import colors from 'ansi-colors';

import { Api } from './api';
import { handler } from './plugin';
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
      enabled: true,
      name: 'z{{name}}',
      types: {
        infer: { name: '{{name}}ZodType' },
        input: { name: '{{name}}ZodInput' },
        output: { name: '{{name}}ZodOutput' },
      },
    },
    includeInEntry: false,
    metadata: false,
    requests: {
      body: {
        enabled: true,
        name: 'z{{name}}Body',
        types: {
          infer: { name: '{{name}}BodyZodType' },
          input: { name: '{{name}}BodyZodInput' },
          output: { name: '{{name}}BodyZodOutput' },
        },
      },
      enabled: true,
      headers: {
        enabled: true,
        name: 'z{{name}}Headers',
        types: {
          infer: { name: '{{name}}HeadersZodType' },
          input: { name: '{{name}}HeadersZodInput' },
          output: { name: '{{name}}HeadersZodOutput' },
        },
      },
      name: 'z{{name}}Data',
      path: {
        enabled: true,
        name: 'z{{name}}Path',
        types: {
          infer: { name: '{{name}}PathZodType' },
          input: { name: '{{name}}PathZodInput' },
          output: { name: '{{name}}PathZodOutput' },
        },
      },
      query: {
        enabled: true,
        name: 'z{{name}}Query',
        types: {
          infer: { name: '{{name}}QueryZodType' },
          input: { name: '{{name}}QueryZodInput' },
          output: { name: '{{name}}QueryZodOutput' },
        },
      },
      shouldExtract: coerce((value) =>
        typeof value === 'function' ? value : () => Boolean(value),
      ),
      types: {
        infer: { name: '{{name}}DataZodType' },
        input: { name: '{{name}}DataZodInput' },
        output: { name: '{{name}}DataZodOutput' },
      },
    },
    responses: {
      enabled: true,
      name: 'z{{name}}Response',
      types: {
        infer: { name: '{{name}}ResponseZodType' },
        input: { name: '{{name}}ResponseZodInput' },
        output: { name: '{{name}}ResponseZodOutput' },
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
      enabled: true,
      name: 'z{{name}}WebhookRequest',
      types: {
        infer: { name: '{{name}}WebhookRequestZodType' },
        input: { name: '{{name}}WebhookRequestZodInput' },
        output: { name: '{{name}}WebhookRequestZodOutput' },
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
  tags: ['transformer', 'validator'],
};

/**
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
