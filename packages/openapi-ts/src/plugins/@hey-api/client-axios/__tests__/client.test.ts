import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';

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
  ];

  it.each(scenarios)('returns $url', ({ options, url }) => {
    expect(client.buildUrl(options)).toBe(url);
  });
});

describe('AxiosInstance', () => {
  it('should create an AxiosInstance if no axios option passed', () => {
    const client = createClient({ baseURL: 'test-url' });

    expect(client.instance).toBeDefined();
    expect(client.instance.defaults).toBeDefined();
    expect(client.instance.defaults.baseURL).toBe('test-url');
  });

  it('should use the provided AxiosStatic if axios option passed', () => {
    axios.defaults.baseURL = 'test-url';

    const client = createClient({ axios });

    expect(client.instance).toBeDefined();
    expect(client.instance.defaults).toBeDefined();
    expect(client.instance.defaults.baseURL).toBe('test-url');
  });

  it('should use the provided AxiosInstance if axios option is passed', () => {
    const axiosInstance = axios.create({ baseURL: 'test-url' });

    axiosInstance.interceptors.request.use((config) => config);

    const client = createClient({ axios: axiosInstance });

    expect(client.instance).toBe(axiosInstance);
    expect(client.instance.defaults.baseURL).toBe('test-url');
    expect((client.instance.interceptors.request as any).handlers.length).toBe(
      1,
    );
  });
});

describe('unserialized request body handling', () => {
  const client = createClient({ baseURL: 'https://example.com' });

  const scenarios = [
    { body: 0 },
    { body: false },
    { body: 'test string' },
    { body: '' },
  ];

  it.each(scenarios)(
    'handles plain text body with $body value',
    async ({ body }) => {
      const mockAxios = vi.fn();

      await client.post({
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        body,
        bodySerializer: null,
        headers: {
          'Content-Type': 'text/plain',
        },
        url: '/test',
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: body,
        }),
      );
    },
  );
});

describe('serialized request body handling', () => {
  const client = createClient({ baseURL: 'https://example.com' });

  const scenarios = [
    {
      body: '',
      expectBodyValue: false,
      serializedBody: '',
    },
    {
      body: 0,
      expectBodyValue: true,
      serializedBody: 0,
    },
    {
      body: false,
      expectBodyValue: true,
      serializedBody: false,
    },
    {
      body: {},
      expectBodyValue: true,
      serializedBody: '{"key":"value"}',
    },
  ];

  it.each(scenarios)(
    'handles $serializedBody serializedBody value',
    async ({ body, expectBodyValue, serializedBody }) => {
      const mockAxios = vi.fn();

      await client.post({
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        body,
        bodySerializer: () => serializedBody,
        headers: {
          'Content-Type': 'application/json',
        },
        url: '/test',
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectBodyValue ? serializedBody : null,
        }),
      );
    },
  );
});
