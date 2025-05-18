import * as http from '@hey-api/test-utils';
import { describe, expect, it, test, vi } from 'vitest';

import type { Auth } from '..';
import { createClient } from '../client';
import type { Config, RequestOptions } from '../types';

describe('buildUrl', () => {
  const client = createClient();

  const scenarios: {
    options: Parameters<typeof client.buildUrl>[0];
    url: string;
  }[] = [
    { options: { url: '' }, url: '/' },
    { options: { url: '/foo' }, url: '/foo' },
    {
      options: { path: { fooId: 1 }, url: '/foo/{fooId}' },
      url: '/foo/1',
    },
    {
      options: {
        path: { fooId: 1 },
        query: { bar: 'baz' },
        url: '/foo/{fooId}',
      },
      url: '/foo/1?bar=baz',
    },
  ];

  it.each(scenarios)('returns $url', ({ options, url }) => {
    expect(client.buildUrl(options)).toBe(url);
  });
});

test('composables return matching results', async () => {
  const client = createClient({ baseURL: 'https://localhost' });
  const server = http.newServer(http.mockPetHandlers('https://localhost'));

  const fetchResult = await client.get<'$fetch', http.Pet>({
    composable: '$fetch',
    url: '/pets/1',
  });
  expect(fetchResult).toEqual(http.petsData[0]);

  const useFetchResult = await client.get<'useFetch', http.Pet>({
    composable: 'useFetch',
    url: '/pets/1',
  });
  expect(useFetchResult.data.value).toEqual(http.petsData[0]);

  const useAsyncDataResult = await client.get<'useAsyncData', http.Pet>({
    composable: 'useAsyncData',
    url: '/pets/1',
  });
  expect(useAsyncDataResult.data.value).toEqual(http.petsData[0]);

  // Lazy* composables aren't actually lazy when invoked outside of Nuxt, so we can't
  // validate the lazy logic itself (nor should we need to).
  const useLazyAsyncDataResult = await client.get<'useLazyAsyncData', http.Pet>(
    {
      composable: 'useLazyAsyncData',
      url: '/pets/1',
    },
  );
  expect(useLazyAsyncDataResult.data.value).toEqual(http.petsData[0]);

  const useLazyFetchResult = await client.get<'useLazyFetch', http.Pet>({
    composable: 'useLazyFetch',
    url: '/pets/1',
  });
  expect(useLazyFetchResult.data.value).toEqual(http.petsData[0]);

  expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(5);
});

describe('merge headers', async () => {
  const base: Config = {
    baseURL: 'https://localhost',
  };

  const tests: {
    client: ReturnType<typeof createClient>;
    inRequest: Record<string, string>;
    name: string;
    required: Record<string, string>;
    security?: RequestOptions['security'];
  }[] = [
    {
      client: createClient({ ...base, headers: { 'X-From-Client': 'foo' } }),
      inRequest: {},
      name: '1 from client, also in final.',
      required: { 'X-From-Client': 'foo' },
    },
    {
      client: createClient(base),
      inRequest: { 'X-Request': 'example-value' },
      name: '1 from request, also in final.',
      required: { 'X-Request': 'example-value' },
    },
    {
      client: createClient({
        ...base,
        auth: async () => 'x-auth-foo',
        headers: { 'X-From-Client': 'foo' },
      }),
      inRequest: { 'X-Request': 'example-value' },
      name: '1 from request, 1 from client, 1 from auth, all 3 exist in final.',
      required: {
        'X-Auth-Foo': 'x-auth-foo',
        'X-From-Client': 'foo',
        'X-Request': 'example-value',
      },
      security: [{ in: 'header', name: 'X-Auth-Foo', type: 'http' }],
    },
    {
      client: createClient({
        ...base,
        headers: { 'X-From-Client': 'foo', 'X-From-Client-2': 'bar' },
      }),
      inRequest: {
        'X-Request': 'example-value',
        'X-Request-2': 'example-value-2',
      },
      name: '2 from client, 2 from request, all 4 exist in final.',
      required: {
        'X-From-Client': 'foo',
        'X-From-Client-2': 'bar',
        'X-Request': 'example-value',
        'X-Request-2': 'example-value-2',
      },
    },
    {
      client: createClient({
        ...base,
        headers: { 'X-Foo': 'foo', 'X-From-Client': 'foo' },
      }),
      inRequest: {
        'X-Foo': 'bar',
        'X-Request': 'example-value',
      },
      name: '2 from client, 2 from request, 1 overlap, and request overrides client.',
      required: {
        'X-Foo': 'bar',
        'X-From-Client': 'foo',
        'X-Request': 'example-value',
      },
    },
  ];

  it.each(tests)(
    '$name',
    async ({ client, inRequest: requested, required: expected, security }) => {
      const server = http.newServer([http.mockVerboseHandler(base.baseURL!)]);

      const result = await client.get<'useFetch', http.VerboseResponse>({
        composable: 'useFetch',
        headers: requested,
        security,
        url: '/verbose',
      });

      const headers = new Headers(result.data.value?.headers);
      for (const [key, value] of Object.entries(expected)) {
        expect(headers.get(key)).toBe(value);
      }
      server.expectAllCalled();
    },
  );
});

test('interceptors invoked', async () => {
  const onRequest = vi.fn(() => {});
  const onResponse = vi.fn(() => {});

  const client = createClient({
    baseURL: 'https://localhost',
    onRequest,
    onResponse,
  });

  const server = http.newServer(http.mockPetHandlers('https://localhost'));

  const result = await client.get<'useFetch', http.Pet>({
    composable: 'useFetch',
    url: '/pets/1',
  });

  expect(result.data.value).toEqual(http.petsData[0]);
  expect(onRequest).toHaveBeenCalledTimes(1);
  expect(onResponse).toHaveBeenCalledTimes(1);
  expect(onResponse).toHaveBeenCalledAfter(onRequest);
  expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(1);
  onRequest.mockReset();
  onResponse.mockReset();

  const result2 = await client.get<'useFetch', http.Pet>({
    composable: 'useFetch',
    url: '/pets/1',
  });

  expect(result2.data.value).toEqual(http.petsData[0]);
  expect(onRequest).toHaveBeenCalledTimes(1);
  expect(onResponse).toHaveBeenCalledTimes(1);
  expect(onResponse).toHaveBeenCalledAfter(onRequest);
  expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(2);
});

test('response validators invoked', async () => {
  const client = createClient({
    baseURL: 'https://localhost',
  });

  const server = http.newServer(http.mockPetHandlers('https://localhost'));

  const successResponseValidator = vi.fn(async () => {}); // no-op
  const success = await client.get<'useFetch', http.Pet>({
    composable: 'useFetch',
    responseValidator: successResponseValidator,
    url: '/pets/1',
  });

  expect(success.data.value).toEqual(http.petsData[0]);
  expect(successResponseValidator).toHaveBeenCalledTimes(1);
  expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(1);

  const failResponseValidator = vi.fn(async () => {
    throw new Error('testing');
  });
  const failed = await client.get<'useFetch', http.Pet>({
    composable: 'useFetch',
    responseValidator: failResponseValidator,
    url: '/pets/1',
  });

  expect(failed.error.value).toBeDefined();
  expect(failed.error.value?.message).toBe('testing');
  expect(failResponseValidator).toHaveBeenCalledTimes(1);
  expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(2);
});

test('response transformers', async () => {
  const responseTransformer = vi.fn(async (data: unknown) => {
    if (typeof data === 'object' && data !== null) {
      return {
        ...data,
        transformed: true,
      };
    }
    return data;
  });

  const client = createClient({
    baseURL: 'https://localhost',
    responseTransformer,
  });

  const server = http.newServer(http.mockPetHandlers('https://localhost'));

  const result = await client.get<'useFetch', http.Pet>({
    composable: 'useFetch',
    url: '/pets/1',
  });

  expect(responseTransformer).toHaveBeenCalledTimes(1);
  expect(result.data.value).toEqual({
    ...http.petsData[0],
    transformed: true,
  });
  expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(1);
});

test('custom body serializer', async () => {
  type Body = {
    name: string;
    serialized: boolean;
  };

  const customBodySerializer = vi.fn((data: Omit<Body, 'serialized'>) =>
    JSON.stringify({ ...data, serialized: true }),
  );

  const client = createClient({
    baseURL: 'https://localhost',
    bodySerializer: customBodySerializer,
  });

  const server = http.newServer([http.mockVerboseHandler('https://localhost')]);

  const result = await client.post<'useFetch', http.VerboseResponse>({
    body: { name: 'Custom Pet' },
    composable: 'useFetch',
    url: '/verbose',
  });

  expect(result.data.value?.body).toEqual({
    name: 'Custom Pet',
    serialized: true,
  });
  expect(result.data.value?.headers['content-type']).toEqual(
    'application/json',
  );
  expect(customBodySerializer).toHaveBeenCalledTimes(1);
  expect(server.spy('post', '/verbose')).toHaveBeenCalledTimes(1);
});

test('custom query serializer', async () => {
  type Response = {
    limit: number;
    tags: string[];
  };

  const customQuerySerializer = {
    allowReserved: false,
    array: { explode: false, style: 'form' as const },
    object: { explode: true, style: 'deepObject' as const },
  };

  const client = createClient({
    baseURL: 'https://localhost',
    querySerializer: customQuerySerializer,
  });

  const server = http.newServer([
    http.handle<any, Response>(
      'get',
      'https://localhost/search',
      ({ request }) => {
        const { searchParams: params } = new URL(request.url);
        return http.json({
          limit: Number(params.get('limit')),
          tags: params.getAll('tags'),
        });
      },
    ),
  ]);

  const result = await client.get<'useFetch', Response>({
    composable: 'useFetch',
    query: { limit: 10, tags: ['cat', 'dog', 'bird'] },
    url: '/search',
  });

  expect(result.data.value).toEqual({
    limit: 10,
    tags: ['cat', 'dog', 'bird'],
  });
  expect(server.spy('get', '/search')).toHaveBeenCalledTimes(1);
});

describe('authentication', () => {
  const base = { baseURL: 'https://localhost' };

  test('sets bearer token in headers', async () => {
    const auth = vi.fn(async () => 'foo');
    const client = createClient({ ...base, auth });
    const server = http.newServer([http.mockVerboseHandler(base.baseURL!)]);

    const result = await client.get<'useFetch', http.VerboseResponse>({
      composable: 'useFetch',
      security: [
        {
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
      url: '/verbose',
    });

    expect(auth).toHaveBeenCalled();
    expect(result.data.value?.headers.baz).toBe('Bearer foo');
    server.expectAllCalled();
  });

  test('sets access token in query', async () => {
    const auth = vi.fn(async () => 'foo');
    const client = createClient({ ...base, auth });
    const server = http.newServer([http.mockVerboseHandler(base.baseURL!)]);

    const result = await client.get<'useFetch', http.VerboseResponse>({
      composable: 'useFetch',
      security: [
        {
          in: 'query',
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
      url: '/verbose',
    });

    expect(auth).toHaveBeenCalled();
    expect(result.data.value?.query.baz).toBe('Bearer foo');
    server.expectAllCalled();
  });

  test('sets Authorization header when `in` and `name` are undefined', async () => {
    const auth = vi.fn(async () => 'foo');
    const client = createClient({ ...base, auth });
    const server = http.newServer([http.mockVerboseHandler(base.baseURL!)]);

    const result = await client.get<'useFetch', http.VerboseResponse>({
      composable: 'useFetch',
      security: [
        {
          type: 'http',
        },
      ],
      url: '/verbose',
    });

    expect(auth).toHaveBeenCalled();
    expect(result.data.value?.headers.authorization).toBe('foo');
    server.expectAllCalled();
  });

  test('sets first scheme only', async () => {
    const auth = vi.fn(async () => 'foo');
    const client = createClient({ ...base, auth });
    const server = http.newServer([http.mockVerboseHandler(base.baseURL!)]);

    const result = await client.get<'useFetch', http.VerboseResponse>({
      composable: 'useFetch',
      security: [
        {
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
        {
          in: 'query',
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
      url: '/verbose',
    });

    expect(auth).toHaveBeenCalled();
    expect(result.data.value?.headers.baz).toBe('Bearer foo');
    expect(result.data.value?.query.baz).toBeUndefined();
    server.expectAllCalled();
  });

  test('sets first scheme with token', async () => {
    const auth = vi.fn((auth: Auth) => {
      if (auth.type === 'apiKey') {
        return;
      }
      return 'foo';
    });

    const client = createClient({ ...base, auth });
    const server = http.newServer([http.mockVerboseHandler(base.baseURL!)]);

    const result = await client.get<'useFetch', http.VerboseResponse>({
      composable: 'useFetch',
      security: [
        {
          name: 'baz',
          type: 'apiKey',
        },
        {
          in: 'query',
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
      url: '/verbose',
    });

    expect(auth).toHaveBeenCalled();
    expect(result.data.value?.headers.baz).toBeUndefined();
    expect(result.data.value?.query.baz).toBe('Bearer foo');
    server.expectAllCalled();
  });
});
