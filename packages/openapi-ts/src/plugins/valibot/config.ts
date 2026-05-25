import { coerce, definePluginConfig } from '@hey-api/shared';

import { Api } from './api';
import { handler } from './plugin';
import type { ValibotPlugin } from './types';

export const defaultConfig: ValibotPlugin['Config'] = {
  api: new Api(),
  config: {
    $cascade: ['case'],
    case: 'camelCase',
    comments: true,
    definitions: {
      $coerce: {
        boolean: (v) => ({ enabled: v }),
        function: (v) => ({ name: v }),
        string: (v) => ({ name: v }),
      },
      enabled: true,
      name: 'v{{name}}',
    },
    includeInEntry: false,
    metadata: false,
    requests: {
      $coerce: {
        boolean: (v) => ({ enabled: v }),
        function: (v) => ({ name: v }),
        string: (v) => ({ name: v }),
      },
      body: {
        $coerce: {
          boolean: (v) => ({ enabled: v }),
          function: (v) => ({ name: v }),
          string: (v) => ({ name: v }),
        },
        enabled: true,
        name: 'v{{name}}Body',
      },
      enabled: true,
      headers: {
        $coerce: {
          boolean: (v) => ({ enabled: v }),
          function: (v) => ({ name: v }),
          string: (v) => ({ name: v }),
        },
        enabled: true,
        name: 'v{{name}}Headers',
      },
      name: 'v{{name}}Data',
      path: {
        $coerce: {
          boolean: (v) => ({ enabled: v }),
          function: (v) => ({ name: v }),
          string: (v) => ({ name: v }),
        },
        enabled: true,
        name: 'v{{name}}Path',
      },
      query: {
        $coerce: {
          boolean: (v) => ({ enabled: v }),
          function: (v) => ({ name: v }),
          string: (v) => ({ name: v }),
        },
        enabled: true,
        name: 'v{{name}}Query',
      },
      shouldExtract: coerce((value) =>
        typeof value === 'function' ? value : () => Boolean(value),
      ),
    },
    responses: {
      $coerce: {
        boolean: (v) => ({ enabled: v }),
        function: (v) => ({ name: v }),
        string: (v) => ({ name: v }),
      },
      enabled: true,
      name: 'v{{name}}Response',
    },
    webhooks: {
      $coerce: {
        boolean: (v) => ({ enabled: v }),
        function: (v) => ({ name: v }),
        string: (v) => ({ name: v }),
      },
      enabled: true,
      name: 'v{{name}}WebhookRequest',
    },
  },
  handler,
  name: 'valibot',
  tags: ['transformer', 'validator'],
};

/**
 * Type helper for Valibot plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
