import type { PluginContext } from '~/plugins/types';

import type { UserConfig } from '../types';
import type { HttpRequestsConfig, UserHttpRequestsConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveHttpRequests(
  config: Config,
  context: PluginContext,
): HttpRequestsConfig {
  let input = config.httpRequests;
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
      methods: 'static',
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
              ? { casing: 'PascalCase', name: 'HttpRequests' }
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
              ? { casing: 'camelCase', name: '{{name}}Request' }
              : { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.methodName,
        });
        value.segmentName = context.valueToObject({
          defaultValue: { casing: 'PascalCase', name: '{{name}}Requests' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.segmentName,
        });
        return value;
      },
    },
    value: input as UserHttpRequestsConfig,
  }) as HttpRequestsConfig;
}
