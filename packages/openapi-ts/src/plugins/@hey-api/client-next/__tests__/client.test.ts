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
