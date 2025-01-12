import { describe, expect, it, vi } from 'vitest';

import type { Auth } from '../types';
import { getAuthToken, setAuthParams } from '../utils';

describe('getAuthToken', () => {
  it('returns bearer token', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const token = await getAuthToken(
      {
        scheme: 'bearer',
        type: 'http',
      },
      auth,
    );
    expect(auth).toHaveBeenCalled();
    expect(token).toBe('Bearer foo');
  });

  it('returns basic token', async () => {
    const auth = vi.fn().mockReturnValue('foo:bar');
    const token = await getAuthToken(
      {
        scheme: 'basic',
        type: 'http',
      },
      auth,
    );
    expect(auth).toHaveBeenCalled();
    expect(token).toBe(`Basic ${btoa('foo:bar')}`);
  });

  it('returns raw token', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const token = await getAuthToken(
      {
        type: 'http',
      },
      auth,
    );
    expect(auth).toHaveBeenCalled();
    expect(token).toBe('foo');
  });

  it('returns nothing when auth function is undefined', async () => {
    const token = await getAuthToken(
      {
        type: 'http',
      },
      undefined,
    );
    expect(token).toBeUndefined();
  });
});

describe('setAuthParams', () => {
  it('sets bearer token in headers', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      auth,
      headers,
      query,
      security: [
        {
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
    });
    expect(auth).toHaveBeenCalled();
    expect(headers.get('baz')).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets access token in query', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      auth,
      headers,
      query,
      security: [
        {
          in: 'query',
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
    });
    expect(auth).toHaveBeenCalled();
    expect(headers.get('baz')).toBeNull();
    expect(query.baz).toBe('Bearer foo');
  });

  it('sets Authorization header when `in` and `name` are undefined', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      auth,
      headers,
      query,
      security: [
        {
          type: 'http',
        },
      ],
    });
    expect(auth).toHaveBeenCalled();
    expect(headers.get('Authorization')).toBe('foo');
    expect(query).toEqual({});
  });

  it('sets first scheme only', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      auth,
      headers,
      query,
      security: [
        {
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
        {
          in: 'query',
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
    });
    expect(auth).toHaveBeenCalled();
    expect(headers.get('baz')).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets first scheme with token', async () => {
    const auth = vi.fn().mockImplementation((auth: Auth) => {
      if (auth.type === 'apiKey') {
        return;
      }
      return 'foo';
    });
    const headers = new Headers();
    const query: Record<any, unknown> = {};
    await setAuthParams({
      auth,
      headers,
      query,
      security: [
        {
          name: 'baz',
          type: 'apiKey',
        },
        {
          in: 'query',
          name: 'baz',
          scheme: 'bearer',
          type: 'http',
        },
      ],
    });
    expect(auth).toHaveBeenCalled();
    expect(headers.get('baz')).toBeNull();
    expect(query.baz).toBe('Bearer foo');
  });
});
