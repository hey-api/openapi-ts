import type { OperationsStrategy } from '~/openApi/shared/locations';
import { definePluginConfig } from '~/plugins/shared/utils/config';
import type { PluginContext } from '~/plugins/types';
import { resolveNaming } from '~/utils/naming';

import { handler } from './plugin';
import type {
  OrpcContractPlugin,
  RouterConfig,
  UserRouterConfig,
} from './types';

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
        value.keyName = context.valueToObject({
          defaultValue: { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.keyName,
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
    exportFromIndex: false,
    router: {
      keyName: { casing: 'camelCase' },
      nesting: 'operationId',
      nestingDelimiters: /[./]/,
      segmentName: { casing: 'camelCase' },
      strategy: 'flat',
      strategyDefaultTag: 'default',
    },
    routerName: { name: 'router' },
    validator: 'zod',
  },
  handler,
  name: '@orpc/contract',
  resolveConfig: (plugin, context) => {
    plugin.config.exportFromIndex ??= false;
    plugin.config.contractNameBuilder ??= (id: string) => `${id}Contract`;
    plugin.config.router = resolveRouter(plugin.config.router, context);
    plugin.config.routerName = resolveNaming(plugin.config.routerName);
    if (!plugin.config.routerName.name) {
      plugin.config.routerName.name = 'router';
    }

    plugin.config.validator ??= 'zod';
    plugin.dependencies.add(plugin.config.validator);
  },
  tags: ['client'],
};

/**
 * Type helper for oRPC plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
