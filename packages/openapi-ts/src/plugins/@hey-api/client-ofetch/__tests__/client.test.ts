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

  it.each(scenarios)('handles plain text body with $body value', async ({ body, textValue }) => {
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

    await expect(result.request!.text()).resolves.toEqual(textValue);
    expect(result.request!.headers.get('Content-Type')).toEqual('text/plain');
  });
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
    async ({ body, expectBodyValue, expectContentHeader, serializedBody, textValue }) => {
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
      await expect(result.request!.text()).resolves.toEqual(textValue);
      expect(result.request!.headers.get('Content-Type')).toEqual(
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
      bodySerializer: (body: unknown) => JSON.stringify(body),
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
        .mockImplementation((request: Request, options: ResolvedRequestOptions) => {
          expect(options.serializedBody).toBe(expectedSerializedValue);
          expect(options.body).toBe(body);
          return request;
        });

      const interceptorId = client.interceptors.request.use(mockRequestInterceptor);

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

describe('FormData boundary handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  it('should not include Content-Type header for FormData body to avoid boundary mismatch', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const formData = new FormData();
    formData.append('field1', 'value1');
    formData.append('field2', 'value2');

    await client.post({
      body: formData,
      bodySerializer: null,
      ofetch: mockOfetch as any,
      url: '/upload',
    });

    // Verify that ofetch.raw was called
    expect(mockOfetch.raw).toHaveBeenCalledOnce();

    // Get the options passed to ofetch.raw
    const call = (mockOfetch.raw as any).mock.calls[0];
    const opts = call[1];

    // Verify that FormData is passed as body
    expect(opts.body).toBeInstanceOf(FormData);

    // Verify that Content-Type header is NOT set (so ofetch can set its own boundary)
    expect(opts.headers.get('Content-Type')).toBeNull();
  });

  it('should preserve Content-Type header for non-FormData bodies', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    await client.post({
      body: { test: 'data' },
      ofetch: mockOfetch as any,
      url: '/api',
    });

    // Verify that ofetch.raw was called
    expect(mockOfetch.raw).toHaveBeenCalledOnce();

    // Get the options passed to ofetch.raw
    const call = (mockOfetch.raw as any).mock.calls[0];
    const opts = call[1];

    // Verify that Content-Type header IS set for JSON
    expect(opts.headers.get('Content-Type')).toBe('application/json');
  });

  it('should handle FormData with interceptors correctly', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });

    const mockOfetch = makeMockOfetch(mockResponse);

    const formData = new FormData();
    formData.append('field1', 'value1');

    const mockRequestInterceptor = vi.fn().mockImplementation((request: Request) => {
      // Interceptor can modify headers but we should still remove Content-Type for FormData
      request.headers.set('X-Custom-Header', 'custom-value');
      return request;
    });

    const interceptorId = client.interceptors.request.use(mockRequestInterceptor);

    await client.post({
      body: formData,
      bodySerializer: null,
      ofetch: mockOfetch as any,
      url: '/upload',
    });

    expect(mockRequestInterceptor).toHaveBeenCalledOnce();

    // Get the options passed to ofetch.raw
    const call = (mockOfetch.raw as any).mock.calls[0];
    const opts = call[1];

    // Verify that Content-Type is NOT set even after interceptor
    expect(opts.headers.get('Content-Type')).toBeNull();

    // Verify that custom header from interceptor IS preserved
    expect(opts.headers.get('X-Custom-Header')).toBe('custom-value');

    client.interceptors.request.eject(interceptorId);
  });
});

describe('ignoreResponseError config', () => {
  it('createClient default config has ignoreResponseError: false', () => {
    expect(createClient({}).getConfig().ignoreResponseError).toBe(false);
  });

  it('passes ignoreResponseError: false to ofetch.raw by default', async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    const mockOfetch = makeMockOfetch(mockResponse);
    const client = createClient({ baseUrl: 'https://example.com' });

    await client.request({ method: 'GET', ofetch: mockOfetch as any, url: '/test' });

    const opts = (mockOfetch.raw as any).mock.calls[0][1];
    expect(opts.ignoreResponseError).toBe(false);
  });

  it('passes ignoreResponseError: true to ofetch.raw when opted in', async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    const mockOfetch = makeMockOfetch(mockResponse);
    const client = createClient({ baseUrl: 'https://example.com', ignoreResponseError: true });

    await client.request({ method: 'GET', ofetch: mockOfetch as any, url: '/test' });

    const opts = (mockOfetch.raw as any).mock.calls[0][1];
    expect(opts.ignoreResponseError).toBe(true);
  });

  it('ignoreResponseError: true opt-out — ofetch resolves 404 without entering FetchError catch', async () => {
    // When ignoreResponseError is true, ofetch resolves the FetchResponse instead of throwing.
    // Verify: the new catch branch is never entered (raw resolves, not rejects),
    // and the client still surfaces { error, response } for non-2xx.
    const mockResponse = new Response(JSON.stringify({ message: 'Not Found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
    (mockResponse as any)._data = { message: 'Not Found' };

    const mockOfetch = makeMockOfetch(mockResponse); // resolves, not rejects
    const client = createClient({ baseUrl: 'https://example.com', ignoreResponseError: true });

    const result = await client.request({ method: 'GET', ofetch: mockOfetch as any, url: '/test' });

    // ofetch.raw resolved normally — raw should have been called once with no rejection
    expect(mockOfetch.raw).toHaveBeenCalledOnce();
    const opts = (mockOfetch.raw as any).mock.calls[0][1];
    expect(opts.ignoreResponseError).toBe(true);

    // client still identifies the non-2xx as an error and returns it in fields style
    expect(result.error).toEqual({ message: 'Not Found' });
    expect(result.response?.status).toBe(404);
  });
});

describe('non-2xx response handling', () => {
  const client = createClient({ baseUrl: 'https://example.com' });

  const makeMockOfetchWithError = (response: Response): MockOfetch => {
    const fn: any = vi.fn();
    const error: any = new Error('FetchError');
    error.response = response;
    fn.raw = vi.fn().mockRejectedValue(error);
    return fn as MockOfetch;
  };

  it('response interceptors still run for 4xx responses', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Not Found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });

    const mockOfetch = makeMockOfetchWithError(mockResponse);
    const responseInterceptor = vi.fn().mockImplementation((r: Response) => r);
    const interceptorId = client.interceptors.response.use(responseInterceptor);

    await client.request({ method: 'GET', ofetch: mockOfetch as any, url: '/test' });

    expect(responseInterceptor).toHaveBeenCalledOnce();
    expect(responseInterceptor.mock.calls[0]![0]).toHaveProperty('status', 404);

    client.interceptors.response.eject(interceptorId);
  });

  it('returns error payload when ofetch throws for 4xx', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Not Found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
    (mockResponse as any)._data = { message: 'Not Found' };

    const mockOfetch = makeMockOfetchWithError(mockResponse);

    const result = await client.request({ method: 'GET', ofetch: mockOfetch as any, url: '/test' });

    expect(result.error).toEqual({ message: 'Not Found' });
    expect(result.response?.status).toBe(404);
  });

  it('handles network errors (no response) via error interceptors', async () => {
    const fn: any = vi.fn();
    fn.raw = vi.fn().mockRejectedValue(new Error('Network error'));
    const mockOfetch = fn as MockOfetch;

    const result = await client.request({ method: 'GET', ofetch: mockOfetch as any, url: '/test' });

    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('Network error');
    expect(result.response).toBeUndefined();
  });
});

// Note: дополнительные проверки поведения ofetch (responseType/responseStyle/retry)
// не дублируем, чтобы набор тестов оставался сопоставим с другими клиентами.
