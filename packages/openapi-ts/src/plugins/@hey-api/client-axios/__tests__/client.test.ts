import axios from 'axios';
import { describe, expect, it } from 'vitest';

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
