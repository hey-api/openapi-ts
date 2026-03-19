import { log } from '@hey-api/codegen-core';
import type { OperationsStrategy, PluginContext } from '@hey-api/shared';
import { definePluginConfig, resolveNaming } from '@hey-api/shared';

import { handler } from './plugin';
import type { OrpcContractPlugin, RouterConfig, UserRouterConfig } from './types';

const validatorInferWarn =
  'You set `validator: true` but no validator plugin was found in your plugins. Add a validator plugin like `zod` to enable this feature. The validator option has been disabled.';

function resolveRouter(
  input: OperationsStrategy | UserRouterConfig | undefined,
  context: PluginContext,
): RouterConfig {
  if (!input || typeof input === 'string' || typeof input === 'function') {
    input = { strategy: input };
  }

  const strategy = input.strategy ?? 'flat';

  return context.valueToObject({
    defaultValue: {
      nesting: 'operationId',
      nestingDelimiters: /[./]/,
      strategy,
      strategyDefaultTag: 'default',
    },
    mappers: {
      object(value) {
        value.methodName = context.valueToObject({
          defaultValue: { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.methodName,
        });
        value.segmentName = context.valueToObject({
          defaultValue: { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.segmentName,
        });
        return value;
      },
    },
    value: input,
  }) as RouterConfig;
}

export const defaultConfig: OrpcContractPlugin['Config'] = {
  config: {
    contractNameBuilder: (id: string) => `${id}Contract`,
    includeInEntry: false,
    router: {
      methodName: { casing: 'camelCase' },
      nesting: 'operationId',
      nestingDelimiters: /[./]/,
      segmentName: { casing: 'camelCase' },
      strategy: 'flat',
      strategyDefaultTag: 'default',
    },
    routerName: { name: 'router' },
  },
  handler,
  name: '@orpc/contract',
  resolveConfig: (plugin, context) => {
    plugin.config.contractNameBuilder ??= (id: string) => `${id}Contract`;
    plugin.config.router = resolveRouter(plugin.config.router, context);
    plugin.config.routerName = resolveNaming(plugin.config.routerName);
    if (!plugin.config.routerName.name) {
      plugin.config.routerName.name = 'router';
    }

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
  },
};

/**
 * Type helper for oRPC plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
