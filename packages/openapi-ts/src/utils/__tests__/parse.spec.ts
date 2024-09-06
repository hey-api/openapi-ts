import { describe, expect, it } from 'vitest';

import type { Operation } from '../../openApi';
import { setConfig } from '../config';
import { operationNameFn } from '../parse';

describe('operationNameFn', () => {
  const optionsCommon: Parameters<typeof setConfig>[0] = {
    client: {
      name: 'legacy/fetch',
    },
    configFile: '',
    debug: false,
    dryRun: true,
    experimental_parser: false,
    exportCore: false,
    input: '',
    output: {
      path: '',
    },
    plugins: [],
    schemas: {
      export: false,
    },
    services: {
      export: false,
      operationId: true,
      response: 'body',
    },
    types: {
      export: false,
    },
    useOptions: false,
  };

  const options1: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    services: {
      export: false,
      operationId: true,
      response: 'body',
    },
  };

  const options2: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    services: {
      export: false,
      operationId: false,
      response: 'body',
    },
  };

  const options3: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    client: {
      name: '@hey-api/client-fetch',
    },
    services: {
      export: false,
      operationId: true,
      response: 'body',
    },
  };

  const options4: Parameters<typeof setConfig>[0] = {
    ...optionsCommon,
    client: {
      name: '@hey-api/client-fetch',
    },
    services: {
      export: false,
      operationId: false,
      response: 'body',
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
    ({ url, method, options, operationId, expected }) => {
      setConfig(options);
      expect(
        operationNameFn({ id: operationId, method, path: url } as Operation),
      ).toBe(expected);
    },
  );
});
