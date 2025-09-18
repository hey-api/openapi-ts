import { describe, expect, it, vi } from 'vitest';

import { createClient } from '../client';

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

describe('error interceptors', () => {
  it('should call error interceptors when fetch throws network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const errorInterceptor = vi.fn().mockImplementation((error) => error);

    const client = createClient({
      baseUrl: 'https://example.com',
      fetch: mockFetch,
    });

    client.interceptors.error.use(errorInterceptor);

    const result = await client.get({ url: '/test' });

    expect(errorInterceptor).toHaveBeenCalledWith(
      expect.any(Error),
      undefined, // no response for network errors
      expect.any(Request),
      expect.any(Object),
    );
    expect(result.error).toBeInstanceOf(Error);
    expect(result.response).toBeUndefined();
  });

  it('should call error interceptors when response is not ok', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      text: vi.fn().mockResolvedValue('Not found'),
    } as unknown as Response;

    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    const errorInterceptor = vi.fn().mockImplementation((error) => error);

    const client = createClient({
      baseUrl: 'https://example.com',
      fetch: mockFetch,
    });

    client.interceptors.error.use(errorInterceptor);

    const result = await client.get({ url: '/test' });

    expect(errorInterceptor).toHaveBeenCalledWith(
      'Not found',
      mockResponse,
      expect.any(Request),
      expect.any(Object),
    );
    expect(result.error).toBe('Not found');
    expect(result.response).toBe(mockResponse);
  });

  it('should throw error when throwOnError is true for network errors', async () => {
    const networkError = new Error('Network error');
    const mockFetch = vi.fn().mockRejectedValue(networkError);
    const errorInterceptor = vi.fn().mockImplementation((error) => error);

    const client = createClient({
      baseUrl: 'https://example.com',
      fetch: mockFetch,
      throwOnError: true,
    });

    client.interceptors.error.use(errorInterceptor);

    await expect(client.get({ url: '/test' })).rejects.toThrow('Network error');

    expect(errorInterceptor).toHaveBeenCalledWith(
      networkError,
      undefined,
      expect.any(Request),
      expect.any(Object),
    );
  });

  it('should allow error interceptors to transform network errors', async () => {
    const originalError = new Error('Network error');
    const transformedError = new Error('Transformed network error');
    const mockFetch = vi.fn().mockRejectedValue(originalError);
    const errorInterceptor = vi.fn().mockReturnValue(transformedError);

    const client = createClient({
      baseUrl: 'https://example.com',
      fetch: mockFetch,
    });

    client.interceptors.error.use(errorInterceptor);

    const result = await client.get({ url: '/test' });

    expect(errorInterceptor).toHaveBeenCalledWith(
      originalError,
      undefined,
      expect.any(Request),
      expect.any(Object),
    );
    expect(result.error).toBe(transformedError);
  });
});
