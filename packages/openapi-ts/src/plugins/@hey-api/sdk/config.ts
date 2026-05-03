import { log } from '@hey-api/codegen-core';
import { definePluginConfig } from '@hey-api/shared';

import { resolveExamples } from './examples';
import { resolveOperations } from './operations';
import { handler } from './plugin';
import type { HeyApiSdkPlugin } from './types';

const transformerInferWarn =
  'You set `transformer: true` but no transformer plugin was found in your plugins. Add a transformer plugin like `@hey-api/transformers` or a validator plugin like `zod` to enable this feature. The transformer option has been disabled.';
const validatorInferWarn =
  'You set `validator: true` but no validator plugin was found in your plugins. Add a validator plugin like `zod` to enable this feature. The validator option has been disabled.';

export const defaultConfig: HeyApiSdkPlugin['Config'] = {
  config: {
    auth: true,
    client: true,
    comments: true,
    includeInEntry: true,
    paramsStructure: 'grouped',
    responseStyle: 'fields',
    transformer: { response: false },
    validator: false,

    // Deprecated - kept for backward compatibility
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    response: 'body',
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: '@hey-api/sdk',
  resolveConfig: (plugin, context) => {
    if (plugin.config.client) {
      if (typeof plugin.config.client === 'boolean') {
        plugin.config.client = context.pluginByTag('client', {
          defaultPlugin: '@hey-api/client-fetch',
        });
      }

      plugin.dependencies.add(plugin.config.client!);
    } else {
      plugin.config.client = false;
    }

    // Normalize transformer to object form
    if (typeof plugin.config.transformer !== 'object' || plugin.config.transformer === null) {
      plugin.config.transformer = {
        response: plugin.config.transformer as Exclude<typeof plugin.config.transformer, object>,
      };
    }

    if (plugin.config.transformer.response) {
      if (typeof plugin.config.transformer.response === 'boolean') {
        // `true`: auto-select transformer plugin, fall back to validator plugin
        let resolved: string | undefined | false = false;
        try {
          resolved = context.pluginByTag('transformer');
        } catch {
          try {
            resolved = context.pluginByTag('validator');
          } catch {
            log.warn(transformerInferWarn);
          }
        }
        plugin.config.transformer.response = resolved as typeof plugin.config.transformer.response;
        if (resolved) {
          plugin.dependencies.add(resolved);
        }
      } else {
        plugin.dependencies.add(plugin.config.transformer.response);
      }
    } else {
      plugin.config.transformer.response = false;
    }

    if (typeof plugin.config.validator !== 'object') {
      plugin.config.validator = {
        request: plugin.config.validator,
        response: plugin.config.validator,
      };
    }

    if (plugin.config.validator.request) {
      if (typeof plugin.config.validator.request === 'boolean') {
        try {
          plugin.config.validator.request = context.pluginByTag('validator');
          plugin.dependencies.add(plugin.config.validator.request!);
        } catch {
          log.warn(validatorInferWarn);
          plugin.config.validator.request = false;
        }
      } else {
        plugin.dependencies.add(plugin.config.validator.request);
      }
    } else {
      plugin.config.validator.request = false;
    }

    if (plugin.config.validator.response) {
      if (typeof plugin.config.validator.response === 'boolean') {
        try {
          plugin.config.validator.response = context.pluginByTag('validator');
          plugin.dependencies.add(plugin.config.validator.response!);
        } catch {
          log.warn(validatorInferWarn);
          plugin.config.validator.response = false;
        }
      } else {
        plugin.dependencies.add(plugin.config.validator.response);
      }
    } else {
      plugin.config.validator.response = false;
    }

    plugin.config.examples = resolveExamples(plugin.config, context);
    plugin.config.operations = resolveOperations(plugin.config, context);
  },
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
