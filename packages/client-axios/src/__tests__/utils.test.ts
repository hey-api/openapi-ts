import { describe, expect, it, vi } from 'vitest';

import { getAuthToken, setAuthParams } from '../utils';

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

describe('setAuthParams', () => {
  it('sets access token in headers', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const headers: Record<any, unknown> = {};
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
    expect(headers.baz).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets access token in query', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const headers: Record<any, unknown> = {};
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
    expect(Object.keys(headers).length).toBe(0);
    expect(query.baz).toBe('Bearer foo');
  });

  it('sets first scheme only', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue('bar');
    const headers: Record<any, unknown> = {};
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
    expect(headers.baz).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets first scheme with token', async () => {
    const accessToken = vi.fn().mockReturnValue('foo');
    const apiKey = vi.fn().mockReturnValue(undefined);
    const headers: Record<any, unknown> = {};
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
    expect(Object.keys(headers).length).toBe(0);
    expect(query.baz).toBe('Bearer foo');
  });
});
