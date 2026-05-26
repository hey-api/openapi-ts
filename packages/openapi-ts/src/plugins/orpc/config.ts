import { log } from '@hey-api/codegen-core';
import { type AnyPluginName, definePluginConfig, type PluginTag } from '@hey-api/shared';

import { resolveContracts } from './contracts/config';
import { handler } from './plugin';
import type { OrpcPlugin } from './types';

const validatorInferWarn =
  'You set `validator: true` but no validator plugin was found in your plugins. Add a validator plugin like `zod` to enable this feature. The validator option has been disabled.';

export const defaultConfig: OrpcPlugin['Config'] = {
  config: {
    includeInEntry: false,
  },
  handler,
  name: 'orpc',
  resolveConfig(plugin, context) {
    function resolvePlugin<T extends AnyPluginName | boolean = AnyPluginName>(
      value: boolean | T | undefined,
      tag: PluginTag,
      options?: { defaultPlugin?: Exclude<T, boolean>; warn?: string },
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

    if (typeof plugin.config.validator !== 'object') {
      plugin.config.validator = {
        input: plugin.config.validator,
        output: plugin.config.validator,
      };
    }

    plugin.config.validator.input = resolvePlugin(plugin.config.validator.input, 'validator', {
      warn: validatorInferWarn,
    });
    plugin.config.validator.output = resolvePlugin(plugin.config.validator.output, 'validator', {
      warn: validatorInferWarn,
    });

    plugin.config.contracts = resolveContracts(plugin.config, context);
  },
};

/**
 * Type helper for oRPC plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
