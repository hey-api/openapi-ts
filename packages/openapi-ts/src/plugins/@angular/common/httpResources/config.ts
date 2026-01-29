import type { PluginContext } from '@hey-api/shared';

import type { UserConfig } from '../types';
import type { HttpResourcesConfig, UserHttpResourcesConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveHttpResources(config: Config, context: PluginContext): HttpResourcesConfig {
  let input = config.httpResources;
  if (typeof input === 'string' || typeof input === 'function') {
    input = { strategy: input };
  } else if (typeof input === 'boolean' || !input) {
    input = { enabled: Boolean(input) };
  }

  const strategy = input.strategy ?? 'flat';

  return context.valueToObject({
    defaultValue: {
      container: 'class',
      enabled: true,
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
              ? { casing: 'PascalCase', name: 'HttpResources' }
              : { casing: 'PascalCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.containerName,
        });
        value.methodName = context.valueToObject({
          defaultValue:
            strategy === 'flat'
              ? { casing: 'camelCase', name: '{{name}}Resource' }
              : { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.methodName,
        });
        value.segmentName = context.valueToObject({
          defaultValue: { casing: 'PascalCase', name: '{{name}}Resources' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.segmentName,
        });
        return value;
      },
    },
    value: input as UserHttpResourcesConfig,
  }) as HttpResourcesConfig;
}
