import { createClient } from '../bundle/client';
import type { ResolvedRequestOptions } from '../bundle/types';

type MockFetch = ((...args: any[]) => any) & {
  preconnect?: any;
};

describe('buildUrl', () => {
  const client = createClient();

  const scenarios: {
    options: Parameters<typeof client.buildUrl>[0];
    url: string;
  }[] = [
    {
      options: {
        url: '',
      },
      url: '/',
    },
    {
      options: {
        url: '/foo',
      },
      url: '/foo',
    },
    {
      options: {
        path: {
          fooId: 1,
        },
        url: '/foo/{fooId}',
      },
      url: '/foo/1',
    },
    {
      options: {
        path: {
          fooId: 1,
        },
        query: {
          bar: 'baz',
        },
        url: '/foo/{fooId}',
      },
      url: '/foo/1?bar=baz',
    },
  ];

  it.each(scenarios)('returns $url', ({ options, url }) => {
    expect(client.buildUrl(options)).toBe(url);
  });

  it('uses baseUrl from client config by default', () => {
    const clientWithBase = createClient({ baseUrl: 'https://example.com' });
    expect(clientWithBase.buildUrl({ url: '/foo' })).toBe('https://example.com/foo');
  });

  it('allows overriding baseUrl from client config', () => {
    const clientWithBase = createClient({ baseUrl: 'https://example.com' });
    expect(clientWithBase.buildUrl({ baseUrl: 'https://other.com', url: '/foo' })).toBe(
      'https://other.com/foo',
    );
  });
});

describe('zero-length body handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  it('returns empty object for zero-length JSON response', async () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Length': '0',
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockFetch: MockFetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      fetch: mockFetch,
      method: 'GET',
      url: '/test',
    });

    expect(result.data).toEqual({});
  });

  it('returns empty object for empty JSON response without Content-Length header (status 200)', async () => {
    // Simulates a server returning an empty body with status 200 and no Content-Length header
    // This is the scenario described in the issue where response.json() throws
    const mockResponse = new Response('', {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockFetch: MockFetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      fetch: mockFetch,
      method: 'GET',
      url: '/test',
    });

    expect(result.data).toEqual({});
  });

  it('returns empty object for empty response without Content-Length header and no Content-Type (defaults to JSON)', async () => {
    // Tests the auto-detection behavior when no Content-Type is provided
    const mockResponse = new Response('', {
      status: 200,
    });

    const mockFetch: MockFetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      fetch: mockFetch,
      method: 'GET',
      url: '/test',
    });

    // When parseAs is 'auto' and no Content-Type header exists, it should handle empty body gracefully
    expect(result.data).toBeDefined();
  });
});

describe('unserialized request body handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  const scenarios = [{ body: 0 }, { body: false }, { body: 'test string' }, { body: '' }];

  it.each(scenarios)('handles plain text body with $body value', async ({ body }) => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockFetch: MockFetch = vi.fn().mockResolvedValueOnce(mockResponse);
    const headers = new Headers({ 'Content-Type': 'text/plain' });

    await client.post({
      body,
      bodySerializer: null,
      fetch: mockFetch,
      headers: {
        'Content-Type': 'text/plain',
      },
      url: '/test',
    });

    expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
      expect.any(String),
      expect.objectContaining({
        body,
        headers,
      }),
    );
  });
});

describe('serialized request body handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  const scenarios = [
    {
      body: '',
      expectBodyValue: false,
      expectContentHeader: false,
      serializedBody: '',
    },
    {
      body: 0,
      expectBodyValue: true,
      expectContentHeader: true,
      serializedBody: 0,
    },
    {
      body: false,
      expectBodyValue: true,
      expectContentHeader: true,
      serializedBody: false,
    },
    {
      body: {},
      expectBodyValue: true,
      expectContentHeader: true,
      serializedBody: '{"key":"value"}',
    },
  ];

  it.each(scenarios)(
    'handles $serializedBody serializedBody value',
    async ({ body, expectBodyValue, expectContentHeader, serializedBody }) => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      });

      const mockFetch: MockFetch = vi.fn().mockResolvedValueOnce(mockResponse);
      const headers = new Headers({ 'Content-Type': 'application/json' });

      await client.post({
        body,
        bodySerializer: () => serializedBody,
        fetch: mockFetch,
        headers: {
          'Content-Type': 'application/json',
        },
        url: '/test',
      });

      expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
        expect.any(String),
        expect.objectContaining({
          body: expectBodyValue ? serializedBody : null,
          headers: expectContentHeader ? headers : new Headers(),
        }),
      );
    },
  );
});

describe('request interceptor', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  const scenarios = [
    {
      body: 'test string',
      bodySerializer: null,
      contentType: 'text/plain',
      expectedSerializedValue: undefined,
      expectedValue: 'test string',
    },
    {
      body: { key: 'value' },
      bodySerializer: (body: unknown) => JSON.stringify(body),
      contentType: 'application/json',
      expectedSerializedValue: '{"key":"value"}',
      expectedValue: '{"key":"value"}',
    },
  ];

  it.each(scenarios)(
    'exposes $contentType serialized and raw body in interceptor',
    async ({ body, bodySerializer, contentType, expectedSerializedValue }) => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      });

      const mockFetch: MockFetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const mockRequestInterceptor = vi
        .fn()
        .mockImplementation((options: ResolvedRequestOptions) => {
          expect(options.serializedBody).toBe(expectedSerializedValue);
          expect(options.body).toBe(body);

          return options;
        });

      const interceptorId = client.interceptors.request.use(mockRequestInterceptor);

      await client.post({
        body,
        bodySerializer,
        fetch: mockFetch,
        headers: {
          'Content-Type': contentType,
        },
        url: '/test',
      });

      expect(mockRequestInterceptor).toHaveBeenCalledOnce();

      client.interceptors.request.eject(interceptorId);
    },
  );
});

describe('request interceptor URL mutation', () => {
  // Regression tests for a bug where the final URL was computed before request
  // interceptors ran, causing interceptor mutations to `opts.baseUrl`,
  // `opts.url`, `opts.path`, and `opts.query` to be silently ignored.
  const buildOkResponse = () =>
    new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  it('honors interceptor mutations to opts.baseUrl in the fetched URL', async () => {
    const client = createClient({ baseUrl: 'https://example.com' });
    const mockFetch: MockFetch = vi.fn().mockResolvedValue(buildOkResponse());

    const interceptorId = client.interceptors.request.use((options: ResolvedRequestOptions) => {
      options.baseUrl = 'https://rerouted.com';
    });

    await client.get({ fetch: mockFetch, url: '/test' });

    expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
      'https://rerouted.com/test',
      expect.any(Object),
    );

    client.interceptors.request.eject(interceptorId);
  });

  it('honors interceptor mutations to opts.url in the fetched URL', async () => {
    const client = createClient({ baseUrl: 'https://example.com' });
    const mockFetch: MockFetch = vi.fn().mockResolvedValue(buildOkResponse());

    const interceptorId = client.interceptors.request.use((options: ResolvedRequestOptions) => {
      options.url = '/rewritten';
    });

    await client.get({ fetch: mockFetch, url: '/original' });

    expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
      'https://example.com/rewritten',
      expect.any(Object),
    );

    client.interceptors.request.eject(interceptorId);
  });

  it('honors interceptor mutations to opts.path in the fetched URL', async () => {
    const client = createClient({ baseUrl: 'https://example.com' });
    const mockFetch: MockFetch = vi.fn().mockResolvedValue(buildOkResponse());

    const interceptorId = client.interceptors.request.use((options: ResolvedRequestOptions) => {
      options.path = { id: 42 };
    });

    await client.get({ fetch: mockFetch, url: '/items/{id}' });

    expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
      'https://example.com/items/42',
      expect.any(Object),
    );

    client.interceptors.request.eject(interceptorId);
  });

  it('honors interceptor mutations to opts.query in the fetched URL', async () => {
    const client = createClient({ baseUrl: 'https://example.com' });
    const mockFetch: MockFetch = vi.fn().mockResolvedValue(buildOkResponse());

    const interceptorId = client.interceptors.request.use((options: ResolvedRequestOptions) => {
      options.query = { bar: 'baz' };
    });

    await client.get({ fetch: mockFetch, url: '/items' });

    expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
      'https://example.com/items?bar=baz',
      expect.any(Object),
    );

    client.interceptors.request.eject(interceptorId);
  });
});

describe('error interceptor chain composition', () => {
  // Regression test for a bug where each error interceptor received the
  // original `error` rather than the previous interceptor's output, silently
  // dropping transformations earlier in the chain.
  it('passes each interceptor the previous interceptor output, not the original error', async () => {
    const client = createClient({ baseUrl: 'https://example.com' });

    const errorResponse = new Response(JSON.stringify({ message: 'original' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });

    const mockFetch: MockFetch = vi.fn().mockResolvedValue(errorResponse);

    const firstInterceptor = vi.fn((error: unknown) => ({
      ...(error as object),
      first: true,
    }));
    const secondInterceptor = vi.fn((error: unknown) => ({
      ...(error as object),
      second: true,
    }));

    const firstId = client.interceptors.error.use(firstInterceptor);
    const secondId = client.interceptors.error.use(secondInterceptor);

    const result = await client.get({ fetch: mockFetch, url: '/test' });

    // The second interceptor must see the first interceptor's output
    // (including `first: true`), not the original payload.
    expect(secondInterceptor).toHaveBeenCalledWith(
      expect.objectContaining({ first: true, message: 'original' }),
      expect.any(Response),
      expect.any(Object),
    );

    // The returned error should carry transformations from both interceptors.
    expect(result.error).toEqual({
      first: true,
      message: 'original',
      second: true,
    });

    client.interceptors.error.eject(firstId);
    client.interceptors.error.eject(secondId);
  });
});
