import { log } from '@hey-api/codegen-core';
import { definePluginConfig } from '@hey-api/shared';

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
  resolveConfig: (plugin, context) => {
    if (typeof plugin.config.validator !== 'object') {
      plugin.config.validator = {
        input: plugin.config.validator,
        output: plugin.config.validator,
      };
    }

    if (plugin.config.validator.input || plugin.config.validator.input === undefined) {
      if (
        typeof plugin.config.validator.input === 'boolean' ||
        plugin.config.validator.input === undefined
      ) {
        try {
          plugin.config.validator.input = context.pluginByTag('validator');
          plugin.dependencies.add(plugin.config.validator.input!);
        } catch {
          // avoid showing the warning with default configuration as it would be confusing
          if (plugin.config.validator.input !== undefined) {
            log.warn(validatorInferWarn);
          }
          plugin.config.validator.input = false;
        }
      } else {
        plugin.dependencies.add(plugin.config.validator.input);
      }
    } else {
      plugin.config.validator.input = false;
    }

    if (plugin.config.validator.output || plugin.config.validator.output === undefined) {
      if (
        typeof plugin.config.validator.output === 'boolean' ||
        plugin.config.validator.output === undefined
      ) {
        try {
          plugin.config.validator.output = context.pluginByTag('validator');
          plugin.dependencies.add(plugin.config.validator.output!);
        } catch {
          // avoid showing the warning with default configuration as it would be confusing
          if (plugin.config.validator.output !== undefined) {
            log.warn(validatorInferWarn);
          }
          plugin.config.validator.output = false;
        }
      } else {
        plugin.dependencies.add(plugin.config.validator.output);
      }
    } else {
      plugin.config.validator.output = false;
    }

    plugin.config.contracts = resolveContracts(plugin.config, context);
  },
};

/**
 * Type helper for oRPC plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
