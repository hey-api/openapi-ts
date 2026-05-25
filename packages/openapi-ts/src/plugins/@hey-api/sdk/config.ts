import { log } from '@hey-api/codegen-core';
import type { PluginTag } from '@hey-api/shared';
import { definePluginConfig } from '@hey-api/shared';

import { resolveExamples } from './examples';
import { resolveOperations } from './operations';
import { handler } from './plugin';
import type { HeyApiSdkPlugin } from './types';

const transformerInferWarn =
  'You set `transformer: true` but no transformer plugin was found in your plugins. Add a transformer plugin like `@hey-api/transformers` to enable this feature. The transformer option has been disabled.';
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
    transformer: false,
    validator: false,

    // Deprecated - kept for backward compatibility
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    response: 'body',
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: '@hey-api/sdk',
  resolveConfig: (plugin, context) => {
    function resolvePlugin<T>(
      value: boolean | T | undefined,
      tag: PluginTag,
      options?: { defaultPlugin?: string; warn?: string },
    ): T | false {
      if (value === false) return false;
      if (typeof value === 'string') {
        plugin.dependencies.add(value);
        return value;
      }
      try {
        const resolved = context.pluginByTag(
          tag,
          options?.defaultPlugin ? { defaultPlugin: options.defaultPlugin } : undefined,
        );
        if (resolved) plugin.dependencies.add(resolved);
        return (resolved as T) ?? false;
      } catch {
        if (value !== undefined && options?.warn) log.warn(options.warn);
        return false;
      }
    }

    plugin.config.client = resolvePlugin(plugin.config.client, 'client', {
      defaultPlugin: '@hey-api/client-fetch',
    });

    if (typeof plugin.config.transformer !== 'object') {
      plugin.config.transformer = {
        response: plugin.config.transformer,
      };
    }

    plugin.config.transformer.response = resolvePlugin(
      plugin.config.transformer.response,
      'transformer',
      { warn: transformerInferWarn },
    );

    if (typeof plugin.config.validator !== 'object') {
      plugin.config.validator = {
        request: plugin.config.validator,
        response: plugin.config.validator,
      };
    }

    plugin.config.validator.request = resolvePlugin(plugin.config.validator.request, 'validator', {
      warn: validatorInferWarn,
    });
    plugin.config.validator.response = resolvePlugin(
      plugin.config.validator.response,
      'validator',
      {
        warn: validatorInferWarn,
      },
    );

    plugin.config.examples = resolveExamples(plugin.config, context);
    plugin.config.operations = resolveOperations(plugin.config, context);
  },
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
