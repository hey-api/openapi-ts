import { describe, expect, it, vi } from 'vitest';

import { createClient } from '../bundle/client';
import type { ResolvedRequestOptions } from '../bundle/types';

type MockOfetch = ((...args: any[]) => any) & {
  raw?: any;
};

const makeMockOfetch = (response: Response): MockOfetch => {
  const fn: any = vi.fn();
  fn.raw = vi.fn().mockResolvedValue(response);
  return fn as MockOfetch;
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
    {
      options: {
        query: {
          bar: [],
          foo: [],
        },
        url: '/',
      },
      url: '/',
    },
    {
      options: {
        query: {
          bar: [],
          foo: ['abc', 'def'],
        },
        url: '/',
      },
      url: '/?foo=abc&foo=def',
    },
  ];

  it.each(scenarios)('returns $url', ({ options, url }) => {
    expect(client.buildUrl(options)).toBe(url);
  });
});

describe('zero-length body handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  it('returns empty Blob for zero-length application/octet-stream response', async () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Length': '0',
        'Content-Type': 'application/octet-stream',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const result = await client.request({
      method: 'GET',
      ofetch: mockOfetch as any,
      url: '/test',
    });

    expect(result.data).toBeInstanceOf(Blob);
    expect((result.data as Blob).size).toBe(0);
  });

  it('returns empty ArrayBuffer for zero-length response with arrayBuffer parseAs', async () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Length': '0',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const result = await client.request({
      method: 'GET',
      ofetch: mockOfetch as any,
      parseAs: 'arrayBuffer',
      url: '/test',
    });

    expect(result.data).toBeInstanceOf(ArrayBuffer);
    expect((result.data as ArrayBuffer).byteLength).toBe(0);
  });

  it('returns empty string for zero-length text response', async () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Length': '0',
        'Content-Type': 'text/plain',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const result = await client.request({
      method: 'GET',
      ofetch: mockOfetch as any,
      url: '/test',
    });

    expect(result.data).toBe('');
  });

  it('returns empty object for zero-length JSON response', async () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Length': '0',
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const result = await client.request({
      method: 'GET',
      ofetch: mockOfetch as any,
      url: '/test',
    });

    expect(result.data).toEqual({});
  });

  it('returns empty FormData for zero-length multipart/form-data response', async () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Length': '0',
        'Content-Type': 'multipart/form-data',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const result = await client.request({
      method: 'GET',
      ofetch: mockOfetch as any,
      url: '/test',
    });

    expect(result.data).toBeInstanceOf(FormData);
    expect([...(result.data as FormData).entries()]).toHaveLength(0);
  });

  it('returns stream body for zero-length stream response', async () => {
    const mockBody = new ReadableStream();
    const mockResponse = new Response(mockBody, {
      headers: {
        'Content-Length': '0',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const result = await client.request({
      method: 'GET',
      ofetch: mockOfetch as any,
      parseAs: 'stream',
      url: '/test',
    });

    expect(result.data).toBe(mockBody);
  });

  it('handles non-zero content correctly for comparison', async () => {
    const blobContent = new Blob(['test data']);
    const mockResponse = new Response(blobContent, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const result = await client.request({
      method: 'GET',
      ofetch: mockOfetch as any,
      url: '/test',
    });

    expect(result.data).toBeInstanceOf(Blob);
    expect((result.data as Blob).size).toBeGreaterThan(0);
  });
});

describe('unserialized request body handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  const scenarios = [
    { body: 0, textValue: '0' },
    { body: false, textValue: 'false' },
    { body: 'test string', textValue: 'test string' },
    { body: '', textValue: '' },
  ];

  it.each(scenarios)(
    'handles plain text body with $body value',
    async ({ body, textValue }) => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      });

      const mockOfetch = makeMockOfetch(mockResponse);

      const result = await client.post({
        body,
        bodySerializer: null,
        headers: {
          'Content-Type': 'text/plain',
        },
        ofetch: mockOfetch as any,
        url: '/test',
      });

      await expect(result.request.text()).resolves.toEqual(textValue);
      expect(result.request.headers.get('Content-Type')).toEqual('text/plain');
    },
  );
});

describe('serialized request body handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  const scenarios = [
    {
      body: '',
      expectBodyValue: null,
      expectContentHeader: false,
      serializedBody: '',
      textValue: '',
    },
    {
      body: 0,
      expectBodyValue: 0,
      expectContentHeader: true,
      serializedBody: 0,
      textValue: '0',
    },
    {
      body: false,
      expectBodyValue: false,
      expectContentHeader: true,
      serializedBody: false,
      textValue: 'false',
    },
    {
      body: {},
      expectBodyValue: '{"key":"value"}',
      expectContentHeader: true,
      serializedBody: '{"key":"value"}',
      textValue: '{"key":"value"}',
    },
  ];

  it.each(scenarios)(
    'handles $serializedBody serializedBody value',
    async ({
      body,
      expectBodyValue,
      expectContentHeader,
      serializedBody,
      textValue,
    }) => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      });

      const mockOfetch = makeMockOfetch(mockResponse);

      const result = await client.post({
        body,
        bodySerializer: () => serializedBody,
        headers: {
          'Content-Type': 'application/json',
        },
        ofetch: mockOfetch as any,
        url: '/test',
      });

      // Ensure request captures serialized text value
      await expect(result.request.text()).resolves.toEqual(textValue);
      expect(result.request.headers.get('Content-Type')).toEqual(
        expectContentHeader ? 'application/json' : null,
      );

      // Ensure ofetch.raw received the expected body
      const call = (mockOfetch.raw as any).mock.calls[0];
      const opts = call[1];
      expect(opts.body).toEqual(expectBodyValue);
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
    },
    {
      body: { key: 'value' },
      bodySerializer: (body: object) => JSON.stringify(body),
      contentType: 'application/json',
      expectedSerializedValue: '{"key":"value"}',
    },
  ];

  it.each(scenarios)(
    'exposes $contentType serialized and raw body values',
    async ({ body, bodySerializer, contentType, expectedSerializedValue }) => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      });

      const mockOfetch = makeMockOfetch(mockResponse);

      const mockRequestInterceptor = vi
        .fn()
        .mockImplementation(
          (request: Request, options: ResolvedRequestOptions) => {
            expect(options.serializedBody).toBe(expectedSerializedValue);
            expect(options.body).toBe(body);
            return request;
          },
        );

      const interceptorId = client.interceptors.request.use(
        mockRequestInterceptor,
      );

      await client.post({
        body,
        bodySerializer,
        headers: {
          'Content-Type': contentType,
        },
        ofetch: mockOfetch as any,
        url: '/test',
      });

      expect(mockRequestInterceptor).toHaveBeenCalledOnce();

      client.interceptors.request.eject(interceptorId);
    },
  );
});

// Note: дополнительные проверки поведения ofetch (responseType/responseStyle/retry)
// не дублируем, чтобы набор тестов оставался сопоставим с другими клиентами.
