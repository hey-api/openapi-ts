import type { PluginContext } from '@hey-api/shared';
import { coerce } from '@hey-api/shared';

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

  const strategy = input.strategy ?? 'single';

  return context.valueToObject({
    defaultValue: {
      container: 'object',
      containerName: coerce((value) =>
        context.valueToObject({
          defaultValue:
            strategy === 'single'
              ? { casing: 'camelCase', name: 'contract' }
              : { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value,
        }),
      ),
      contractName: coerce((value) =>
        context.valueToObject({
          defaultValue: { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value,
        }),
      ),
      nesting: 'operationId',
      nestingDelimiters: /[./]/,
      segmentName: coerce((value) =>
        context.valueToObject({
          defaultValue: { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value,
        }),
      ),
      strategy,
      strategyDefaultTag: 'default',
    },
    value: input,
  }) as ContractsConfig;
}
