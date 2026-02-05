import type { OperationsStrategy, PluginContext } from '@hey-api/shared';

import type { UserConfig } from '../types';
import type { OperationsConfig, UserOperationsConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveOperations(config: Config, context: PluginContext): OperationsConfig {
  return normalizeConfig(config.operations, context);
}

function normalizeConfig(
  input: Exclude<OperationsStrategy, 'flat'> | UserOperationsConfig | undefined,
  context: PluginContext,
): OperationsConfig {
  if (!input || typeof input === 'string' || typeof input === 'function') {
    input = { strategy: input };
  }

  const strategy = input.strategy ?? 'single';

  return context.valueToObject({
    defaultValue: {
      container: 'class',
      methods: 'instance',
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
              ? { casing: 'PascalCase', name: 'Sdk' }
              : { casing: 'PascalCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.containerName,
        });
        value.methodName = context.valueToObject({
          defaultValue: { casing: 'snake_case' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.methodName,
        });
        value.segmentName = context.valueToObject({
          defaultValue: { casing: 'PascalCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.segmentName,
        });
        return value;
      },
    },
    value: {
      ...input,
    } as UserOperationsConfig,
  }) as OperationsConfig;
}
