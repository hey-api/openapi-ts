import type { KyInstance } from 'ky';
import { HTTPError } from 'ky';
import { describe, expect, it, vi } from 'vitest';

import type { ResolvedRequestOptions } from '../bundle';
import { createClient } from '../bundle/client';

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

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      method: 'GET',
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

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      method: 'GET',
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

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      method: 'GET',
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

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      method: 'GET',
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

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      method: 'GET',
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

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      method: 'GET',
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

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.request({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      method: 'GET',
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

      const mockKy = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await client.post({
        body,
        bodySerializer: null,
        headers: {
          'Content-Type': 'text/plain',
        },
        ky: mockKy as Partial<KyInstance> as KyInstance,
        url: '/test',
      });

      expect(mockKy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.any(ReadableStream),
        }),
        expect.any(Object),
      );

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
      expectBodyValue: false,
      expectContentHeader: false,
      serializedBody: '',
      textValue: '',
    },
    {
      body: 0,
      expectBodyValue: true,
      expectContentHeader: true,
      serializedBody: 0,
      textValue: '0',
    },
    {
      body: false,
      expectBodyValue: true,
      expectContentHeader: true,
      serializedBody: false,
      textValue: 'false',
    },
    {
      body: {},
      expectBodyValue: true,
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

      const mockKy = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await client.post({
        body,
        bodySerializer: () => serializedBody,
        headers: {
          'Content-Type': 'application/json',
        },
        ky: mockKy as Partial<KyInstance> as KyInstance,
        url: '/test',
      });

      expect(mockKy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expectBodyValue ? expect.any(ReadableStream) : null,
        }),
        expect.any(Object),
      );

      await expect(result.request.text()).resolves.toEqual(textValue);
      expect(result.request.headers.get('Content-Type')).toEqual(
        expectContentHeader ? 'application/json' : null,
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
      expectedValue: async (request: Request) => await request.text(),
    },
    {
      body: { key: 'value' },
      bodySerializer: (body: object) => JSON.stringify(body),
      contentType: 'application/json',
      expectedSerializedValue: '{"key":"value"}',
      expectedValue: async (request: Request) => await request.json(),
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

      const mockKy = vi.fn().mockResolvedValueOnce(mockResponse);

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
        ky: mockKy as Partial<KyInstance> as KyInstance,
        url: '/test',
      });

      expect(mockRequestInterceptor).toHaveBeenCalledOnce();

      client.interceptors.request.eject(interceptorId);
    },
  );
});

describe('response interceptor', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  it('allows response transformation', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const mockResponseInterceptor = vi
      .fn()
      .mockImplementation((response: Response) => {
        expect(response).toBe(mockResponse);
        return response;
      });

    const interceptorId = client.interceptors.response.use(
      mockResponseInterceptor,
    );

    await client.get({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      url: '/test',
    });

    expect(mockResponseInterceptor).toHaveBeenCalledOnce();

    client.interceptors.response.eject(interceptorId);
  });
});

describe('error handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  it('handles HTTP errors with throwOnError: false', async () => {
    const errorResponse = new Response(
      JSON.stringify({ message: 'Not found' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 404,
      },
    );

    const mockKy = vi.fn().mockRejectedValue(
      new HTTPError(errorResponse, new Request('https://example.com/test'), {
        method: 'GET',
      } as any),
    );

    const result = await client.get({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      throwOnError: false,
      url: '/test',
    });

    expect(result.error).toEqual({ message: 'Not found' });
    expect(result.response.status).toBe(404);
  });

  it('throws HTTP errors with throwOnError: true', async () => {
    const errorResponse = new Response(
      JSON.stringify({ message: 'Not found' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 404,
      },
    );

    const mockKy = vi.fn().mockRejectedValue(
      new HTTPError(errorResponse, new Request('https://example.com/test'), {
        method: 'GET',
      } as any),
    );

    await expect(
      client.get({
        ky: mockKy as Partial<KyInstance> as KyInstance,
        throwOnError: true,
        url: '/test',
      }),
    ).rejects.toEqual({ message: 'Not found' });
  });

  it('handles text error responses', async () => {
    const errorResponse = new Response('Internal Server Error', {
      status: 500,
    });

    const mockKy = vi.fn().mockRejectedValue(
      new HTTPError(errorResponse, new Request('https://example.com/test'), {
        method: 'GET',
      } as any),
    );

    const result = await client.get({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      throwOnError: false,
      url: '/test',
    });

    expect(result.error).toBe('Internal Server Error');
    expect(result.response.status).toBe(500);
  });
});

describe('error interceptor', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  it('allows error transformation', async () => {
    const errorResponse = new Response(
      JSON.stringify({ message: 'Not found' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 404,
      },
    );

    const mockKy = vi.fn().mockRejectedValue(
      new HTTPError(errorResponse, new Request('https://example.com/test'), {
        method: 'GET',
      } as any),
    );

    const mockErrorInterceptor = vi
      .fn()
      .mockImplementation((error: any) => ({ transformed: true, ...error }));

    const interceptorId = client.interceptors.error.use(mockErrorInterceptor);

    const result = await client.get({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      throwOnError: false,
      url: '/test',
    });

    expect(mockErrorInterceptor).toHaveBeenCalledOnce();
    expect(result.error).toEqual({ message: 'Not found', transformed: true });

    client.interceptors.error.eject(interceptorId);
  });
});

describe('retry configuration', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  it('passes retry configuration to ky', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    await client.get({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      retry: {
        limit: 3,
        methods: ['get', 'post'],
        statusCodes: [408, 429, 500],
      },
      url: '/test',
    });

    expect(mockKy).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        retry: {
          limit: 3,
          methods: ['get', 'post'],
          statusCodes: [408, 429, 500],
        },
      }),
    );
  });
});

describe('responseStyle configuration', () => {
  const client = createClient({
    baseUrl: 'https://example.com',
    responseStyle: 'data',
  });

  it('returns only data when responseStyle is "data"', async () => {
    const mockResponse = new Response(JSON.stringify({ result: 'success' }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockKy = vi.fn().mockResolvedValue(mockResponse);

    const result = await client.get({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      url: '/test',
    });

    expect(result).toEqual({ result: 'success' });
    expect(result).not.toHaveProperty('response');
    expect(result).not.toHaveProperty('request');
  });

  it('returns undefined for errors when responseStyle is "data"', async () => {
    const errorResponse = new Response(
      JSON.stringify({ message: 'Not found' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 404,
      },
    );

    const mockKy = vi.fn().mockRejectedValue(
      new HTTPError(errorResponse, new Request('https://example.com/test'), {
        method: 'GET',
      } as any),
    );

    const result = await client.get({
      ky: mockKy as Partial<KyInstance> as KyInstance,
      throwOnError: false,
      url: '/test',
    });

    expect(result).toBeUndefined();
  });
});
