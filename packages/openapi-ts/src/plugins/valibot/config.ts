import { coerce, defineNormalizers, definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { ValibotPlugin } from './types';

const normalizeConfig = defineNormalizers<
  ValibotPlugin['Types']['resolvedConfig'],
  ValibotPlugin['Config']['config']
>((c) => {
  const casing = c.case ?? 'camelCase';
  return {
    definitions: {
      case: casing,
      enabled: true,
      name: 'v{{name}}',
    },
    requests: {
      body: {
        case: casing,
        enabled: true,
        name: 'v{{name}}Body',
      },
      case: casing,
      enabled: true,
      headers: {
        case: casing,
        enabled: true,
        name: 'v{{name}}Headers',
      },
      name: 'v{{name}}Data',
      path: {
        case: casing,
        enabled: true,
        name: 'v{{name}}Path',
      },
      query: {
        case: casing,
        enabled: true,
        name: 'v{{name}}Query',
      },
      shouldExtract: coerce((value) =>
        typeof value === 'function' ? value : () => Boolean(value),
      ),
    },
    responses: {
      case: casing,
      enabled: true,
      name: 'v{{name}}Response',
    },
    webhooks: {
      case: casing,
      enabled: true,
      name: 'v{{name}}WebhookRequest',
    },
  };
});

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
    normalizeConfig(plugin.config, context);
  },
  tags: ['transformer', 'validator'],
};

/**
 * Type helper for Valibot plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
