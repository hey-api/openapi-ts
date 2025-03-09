import { describe, expect, it } from 'vitest';

import { operationNameFn } from '../../openApi/common/parser/operation';
import { setConfig } from '../config';

describe('operationNameFn', () => {
  const optionsCommon: Parameters<typeof setConfig>[0] = {
    configFile: '',
    dryRun: true,
    experimentalParser: false,
    exportCore: false,
    input: {
      path: '',
    },
    logs: {
      level: 'info',
      path: process.cwd(),
    },
    output: {
      path: '',
    },
    pluginOrder: ['legacy/fetch', '@hey-api/sdk'],
    plugins: {
      '@hey-api/sdk': {
        _handler: () => {},
        _handlerLegacy: () => {},
        name: '@hey-api/sdk',
        operationId: true,
        response: 'body',
      },
      'legacy/fetch': {
        _handler: () => {},
        _handlerLegacy: () => {},
        _tags: ['client'],
        name: 'legacy/fetch',
      },
    },
    useOptions: false,
    watch: {
      enabled: false,
      interval: 1_000,
      timeout: 60_000,
    },
  };

  const options1: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    plugins: {
      ...optionsCommon.plugins,
      '@hey-api/sdk': {
        _handler: () => {},
        _handlerLegacy: () => {},
        name: '@hey-api/sdk',
        operationId: true,
        response: 'body',
      },
    },
  };

  const options2: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    plugins: {
      ...optionsCommon.plugins,
      '@hey-api/sdk': {
        _handler: () => {},
        _handlerLegacy: () => {},
        name: '@hey-api/sdk',
        operationId: false,
        response: 'body',
      },
    },
  };

  const options3: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    pluginOrder: ['@hey-api/client-fetch', '@hey-api/sdk'],
    plugins: {
      '@hey-api/client-fetch': {
        _handler: () => {},
        _handlerLegacy: () => {},
        _tags: ['client'],
        name: '@hey-api/client-fetch',
      },
      '@hey-api/sdk': {
        _handler: () => {},
        _handlerLegacy: () => {},
        name: '@hey-api/sdk',
        operationId: true,
        response: 'body',
      },
    },
  };

  const options4: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    pluginOrder: ['@hey-api/client-fetch', '@hey-api/sdk'],
    plugins: {
      '@hey-api/client-fetch': {
        _handler: () => {},
        _handlerLegacy: () => {},
        _tags: ['client'],
        name: '@hey-api/client-fetch',
      },
      '@hey-api/sdk': {
        _handler: () => {},
        _handlerLegacy: () => {},
        name: '@hey-api/sdk',
        operationId: false,
        response: 'body',
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
