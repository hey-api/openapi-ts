import type { PluginContext } from '@hey-api/shared';
import { coerce } from '@hey-api/shared';

import type { UserConfig } from '../types';
import type { HttpRequestsConfig, UserHttpRequestsConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveHttpRequests(config: Config, context: PluginContext): HttpRequestsConfig {
  let input = config.httpRequests;
  if (typeof input === 'string' || typeof input === 'function') {
    input = { strategy: input };
  } else if (typeof input === 'boolean') {
    input = { enabled: input };
  } else if (!input) {
    input = {};
  }

  const strategy = input.strategy ?? 'flat';

  return context.valueToObject({
    defaultValue: {
      container: 'class',
      containerName: coerce((value) =>
        context.valueToObject({
          defaultValue:
            strategy === 'single'
              ? { casing: 'PascalCase', name: 'HttpRequests' }
              : { casing: 'PascalCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value,
        }),
      ),
      enabled: true,
      methodName: coerce((value) =>
        context.valueToObject({
          defaultValue:
            strategy === 'flat'
              ? { casing: 'camelCase', name: '{{name}}Request' }
              : { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value,
        }),
      ),
      methods: 'instance',
      nesting: 'operationId',
      nestingDelimiters: /[./]/,
      segmentName: coerce((value) =>
        context.valueToObject({
          defaultValue: { casing: 'PascalCase', name: '{{name}}Requests' },
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
    value: input as UserHttpRequestsConfig,
  }) as HttpRequestsConfig;
}
