// Mock $fetch global (Nuxt auto-import)
const $fetchMock = vi.fn();
vi.stubGlobal('$fetch', $fetchMock);

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

import { useFetch } from 'nuxt/app';
import { computed, ref } from 'vue';

import { createClient } from '../bundle/client';

describe('useFetch with computed body', () => {
  it('does not throw when body is a ComputedRef', () => {
    const client = createClient();
    const page = ref(1);
    const body = computed(() => ({ page: page.value, pageSize: 10 }));

    expect(() => {
      client.post({
        body,
        composable: 'useFetch',
        url: '/test',
      });
    }).not.toThrow();
  });

  it('serializes ComputedRef body correctly on initial call', () => {
    const client = createClient();
    const body = computed(() => ({ page: 1, search: 'hello' }));

    client.post({
      body,
      composable: 'useFetch',
      url: '/test',
    });

    // useFetch should be called with the serialized body as a ref
    expect(useFetch).toHaveBeenCalled();
    const callArgs = vi.mocked(useFetch).mock.calls.at(-1)!;
    const opts = callArgs[1] as Record<string, unknown>;
    // body should be a ref containing the JSON-serialized value
    expect((opts.body as { value: unknown }).value).toBe('{"search":"hello","page":1}');
  });

  it('does not throw when body is a plain Ref', () => {
    const client = createClient();
    const body = ref({ page: 1, pageSize: 10 });

    expect(() => {
      client.post({
        body,
        composable: 'useFetch',
        url: '/test',
      });
    }).not.toThrow();
  });
});

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
