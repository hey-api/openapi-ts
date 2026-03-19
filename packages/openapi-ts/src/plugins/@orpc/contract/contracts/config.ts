import type { PluginContext } from '@hey-api/shared';

import type { UserConfig } from '../types';
import type { ContractsConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveContracts(config: Config, context: PluginContext): ContractsConfig {
  return normalizeConfig(config.contracts, context);
}

function normalizeConfig(input: Config['contracts'], context: PluginContext): ContractsConfig {
  if (!input || typeof input === 'string' || typeof input === 'function') {
    input = { strategy: input };
  }

  const strategy = input.strategy ?? 'flat';

  return context.valueToObject({
    defaultValue: {
      container: 'object',
      nesting: 'operationId',
      nestingDelimiters: /[./]/,
      strategy,
      strategyDefaultTag: 'default',
    },
    mappers: {
      object(value) {
        value.containerName = context.valueToObject({
          defaultValue:
            strategy === 'single'
              ? { casing: 'camelCase', name: 'contract' }
              : { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.containerName,
        });
        value.contractName = context.valueToObject({
          defaultValue: { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.contractName,
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
  }) as ContractsConfig;
}
