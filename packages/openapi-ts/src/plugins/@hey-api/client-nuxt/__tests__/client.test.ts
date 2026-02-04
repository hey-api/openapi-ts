// Mock Nuxt composables with realistic return values
vi.mock('nuxt/app', () => ({
  useAsyncData: vi.fn(() => ({
    data: { value: null },
    error: { value: null },
    pending: { value: false },
    refresh: vi.fn(),
  })),
  useFetch: vi.fn(() => ({
    data: { value: null },
    error: { value: null },
    pending: { value: false },
    refresh: vi.fn(),
  })),
  useLazyAsyncData: vi.fn(() => ({
    data: { value: null },
    error: { value: null },
    pending: { value: false },
    refresh: vi.fn(),
  })),
  useLazyFetch: vi.fn(() => ({
    data: { value: null },
    error: { value: null },
    pending: { value: false },
    refresh: vi.fn(),
  })),
}));

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
