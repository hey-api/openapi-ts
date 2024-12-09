import { describe, expect, it, vi } from 'vitest';

import { getAuthToken, getParseAs, setAuthParams } from '../utils';

describe('getAuthToken', () => {
  it('returns access token', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const token = await getAuthToken(
      {
        fn: 'accessToken',
        in: 'header',
        name: 'baz',
      },
      {
        accessToken,
        apiKey,
      },
    );
    expect(accessToken).toHaveBeenCalled();
    expect(token).toBe('Bearer foo');
  });

  it('returns nothing when accessToken function is undefined', async () => {
    const apiKey = vi.fn().mockReturnValue('bar');
    const token = await getAuthToken(
      {
        fn: 'accessToken',
        in: 'header',
        name: 'baz',
      },
      {
        apiKey,
      },
    );
    expect(token).toBeUndefined();
  });

  it('returns API key', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const token = await getAuthToken(
      {
        fn: 'apiKey',
        in: 'header',
        name: 'baz',
      },
      {
        accessToken,
        apiKey,
      },
    );
    expect(apiKey).toHaveBeenCalled();
    expect(token).toBe('bar');
  });

  it('returns nothing when apiKey function is undefined', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const token = await getAuthToken(
      {
        fn: 'apiKey',
        in: 'header',
        name: 'baz',
      },
      {
        accessToken,
      },
    );
    expect(token).toBeUndefined();
  });
});

describe('getParseAs', () => {
  const scenarios: Array<{
    content: Parameters<typeof getParseAs>[0];
    parseAs: ReturnType<typeof getParseAs>;
  }> = [
    {
      content: null,
      parseAs: undefined,
    },
    {
      content: 'application/json',
      parseAs: 'json',
    },
    {
      content: 'application/ld+json',
      parseAs: 'json',
    },
    {
      content: 'application/ld+json;charset=utf-8',
      parseAs: 'json',
    },
    {
      content: 'application/ld+json; charset=utf-8',
      parseAs: 'json',
    },
    {
      content: 'multipart/form-data',
      parseAs: 'formData',
    },
    {
      content: 'application/*',
      parseAs: 'blob',
    },
    {
      content: 'audio/*',
      parseAs: 'blob',
    },
    {
      content: 'image/*',
      parseAs: 'blob',
    },
    {
      content: 'video/*',
      parseAs: 'blob',
    },
    {
      content: 'text/*',
      parseAs: 'text',
    },
    {
      content: 'unsupported',
      parseAs: undefined,
    },
  ];

  it.each(scenarios)(
    'detects $content as $parseAs',
    async ({ content, parseAs }) => {
      expect(getParseAs(content)).toEqual(parseAs);
    },
  );
});

describe('setAuthParams', () => {
  it('sets access token in headers', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      accessToken,
      apiKey,
      headers,
      query,
      security: [
        {
          fn: 'accessToken',
          in: 'header',
          name: 'baz',
        },
      ],
    });
    expect(accessToken).toHaveBeenCalled();
    expect(headers.get('baz')).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets access token in query', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      accessToken,
      apiKey,
      headers,
      query,
      security: [
        {
          fn: 'accessToken',
          in: 'query',
          name: 'baz',
        },
      ],
    });
    expect(accessToken).toHaveBeenCalled();
    expect(headers.get('baz')).toBeNull();
    expect(query.baz).toBe('Bearer foo');
  });

  it('sets first scheme only', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      accessToken,
      apiKey,
      headers,
      query,
      security: [
        {
          fn: 'accessToken',
          in: 'header',
          name: 'baz',
        },
        {
          fn: 'accessToken',
          in: 'query',
          name: 'baz',
        },
      ],
    });
    expect(accessToken).toHaveBeenCalled();
    expect(headers.get('baz')).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets first scheme with token', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue(undefined);
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      accessToken,
      apiKey,
      headers,
      query,
      security: [
        {
          fn: 'apiKey',
          in: 'header',
          name: 'baz',
        },
        {
          fn: 'accessToken',
          in: 'query',
          name: 'baz',
        },
      ],
    });
    expect(accessToken).toHaveBeenCalled();
    expect(headers.get('baz')).toBeNull();
    expect(query.baz).toBe('Bearer foo');
  });
});
