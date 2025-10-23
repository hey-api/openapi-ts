import { describe, expect, it } from 'vitest';

import { operationNameFn } from '~/openApi/common/parser/operation';

import { setConfig } from '../config';

describe('operationNameFn', () => {
  const optionsCommon: Parameters<typeof setConfig>[0] = {
    configFile: '',
    dryRun: true,
    experimentalParser: false,
    exportCore: false,
    input: [
      {
        path: '',
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
    ],
    interactive: false,
    logs: {
      file: true,
      level: 'info',
      path: process.cwd(),
    },
    output: {
      clean: false,
      fileName: {
        case: 'preserve',
        name: '{{name}}',
        suffix: '.gen',
      },
      format: null,
      importFileExtension: undefined,
      indexFile: true,
      lint: null,
      path: '',
      tsConfig: null,
      tsConfigPath: null,
    },
    parser: {
      hooks: {},
      pagination: {
        keywords: [],
      },
      transforms: {
        enums: {
          case: 'preserve',
          enabled: false,
          mode: 'root',
          name: '',
        },
        propertiesRequiredByDefault: false,
        readWrite: {
          enabled: false,
          requests: {
            case: 'preserve',
            name: '',
          },
          responses: {
            case: 'preserve',
            name: '',
          },
        },
      },
      validate_EXPERIMENTAL: false,
    },
    pluginOrder: ['legacy/fetch', '@hey-api/sdk'],
    plugins: {
      '@hey-api/sdk': {
        api: {
          createOperationComment: () => undefined,
          selector: () => [],
        },
        config: {
          name: '@hey-api/sdk',
          operationId: true,
          response: 'body',
        },
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      },
      'legacy/fetch': {
        config: {
          name: 'legacy/fetch',
        },
        handler: () => {},
        name: 'legacy/fetch',
        output: '',
        tags: ['client'],
      },
    },
    useOptions: false,
  };

  const options1: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    plugins: {
      ...optionsCommon.plugins,
      '@hey-api/sdk': {
        api: {
          createOperationComment: () => undefined,
          selector: () => [],
        },
        config: {
          name: '@hey-api/sdk',
          operationId: true,
          response: 'body',
        },
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      },
    },
  };

  const options2: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    plugins: {
      ...optionsCommon.plugins,
      '@hey-api/sdk': {
        api: {
          createOperationComment: () => undefined,
          selector: () => [],
        },
        config: {
          name: '@hey-api/sdk',
          operationId: false,
          response: 'body',
        },
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      },
    },
  };

  const options3: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    pluginOrder: ['@hey-api/client-fetch', '@hey-api/sdk'],
    plugins: {
      '@hey-api/client-fetch': {
        api: {
          selector: () => [],
        },
        config: {
          name: '@hey-api/client-fetch',
        },
        handler: () => {},
        name: '@hey-api/client-fetch',
        output: '',
        tags: ['client'],
      },
      '@hey-api/sdk': {
        api: {
          createOperationComment: () => undefined,
          selector: () => [],
        },
        config: {
          name: '@hey-api/sdk',
          operationId: true,
          response: 'body',
        },
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      },
    },
  };

  const options4: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    pluginOrder: ['@hey-api/client-fetch', '@hey-api/sdk'],
    plugins: {
      '@hey-api/client-fetch': {
        api: {
          selector: () => [],
        },
        config: {
          name: '@hey-api/client-fetch',
        },
        handler: () => {},
        name: '@hey-api/client-fetch',
        output: '',
        tags: ['client'],
      },
      '@hey-api/sdk': {
        api: {
          createOperationComment: () => undefined,
          selector: () => [],
        },
        config: {
          name: '@hey-api/sdk',
          operationId: false,
          response: 'body',
        },
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      },
    },
  };

  it.each([
    {
      expected: 'getAllUsers',
      method: 'GET',
      operationId: 'GetAllUsers',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'getApiUsers',
      method: 'GET',
      operationId: undefined,
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'postApiUsers',
      method: 'POST',
      operationId: undefined,
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'getAllUsers',
      method: 'GET',
      operationId: 'GetAllUsers',
      options: options1,
      url: '/api/v1/users',
    },
    {
      expected: 'getApiV1Users',
      method: 'GET',
      operationId: undefined,
      options: options1,
      url: '/api/v1/users',
    },
    {
      expected: 'postApiV1Users',
      method: 'POST',
      operationId: undefined,
      options: options1,
      url: '/api/v1/users',
    },
    {
      expected: 'getApiV1UsersById',
      method: 'GET',
      operationId: undefined,
      options: options1,
      url: '/api/v1/users/{id}',
    },
    {
      expected: 'postApiV1UsersById',
      method: 'POST',
      operationId: undefined,
      options: options1,
      url: '/api/v1/users/{id}',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'fooBar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'FooBar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'Foo Bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'foo bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'foo-bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'foo_bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'foo.bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: '@foo.bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: '$foo.bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: '_foo.bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: '-foo.bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: '123.foo.bar',
      options: options1,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'getApiV1Users',
      method: 'GET',
      operationId: 'GetAllUsers',
      options: options2,
      url: '/api/v1/users',
    },
    {
      expected: 'getApiUsers',
      method: 'GET',
      operationId: 'fooBar',
      options: options2,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'getApiUsersByUserIdLocationByLocationId',
      method: 'GET',
      operationId: 'fooBar',
      options: options2,
      url: '/api/v{api-version}/users/{userId}/location/{locationId}',
    },
    {
      expected: 'getAllUsers',
      method: 'GET',
      operationId: 'GetAllUsers',
      options: options3,
      url: '/api/v1/users',
    },
    {
      expected: 'fooBar',
      method: 'GET',
      operationId: 'fooBar',
      options: options3,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'getApiV1Users',
      method: 'GET',
      operationId: 'GetAllUsers',
      options: options4,
      url: '/api/v1/users',
    },
    {
      expected: 'getApiVbyApiVersionUsers',
      method: 'GET',
      operationId: 'fooBar',
      options: options4,
      url: '/api/v{api-version}/users',
    },
    {
      expected: 'getApiVbyApiVersionUsersByUserIdLocationByLocationId',
      method: 'GET',
      operationId: 'fooBar',
      options: options4,
      url: '/api/v{api-version}/users/{userId}/location/{locationId}',
    },
  ])(
    'getOperationName($url, $method, { operationId: $useOperationId }, $operationId) -> $expected',
    ({ expected, method, operationId, options, url }) => {
      setConfig(options);
      expect(
        operationNameFn({
          config: options,
          method,
          operationId,
          path: url,
        }),
      ).toBe(expected);
    },
  );
});
