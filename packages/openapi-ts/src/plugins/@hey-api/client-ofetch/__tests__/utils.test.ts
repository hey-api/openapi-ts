import { describe, expect, it, vi } from 'vitest';

import type { Auth } from '../../client-core/bundle/auth';
import { mergeHeaders, setAuthParams } from '../bundle/utils';

describe('mergeHeaders', () => {
  it('merges plain objects into Headers', () => {
    const headers = mergeHeaders(
      {
        baz: 'qux',
        foo: 'bar',
      },
      {
        baz: 'override',
      },
    );

    expect(headers).toBeInstanceOf(Headers);
    expect(headers.get('foo')).toBe('bar');
    expect(headers.get('baz')).toBe('override');
  });
});

describe('setAuthParams', () => {
  it('sets bearer token in headers', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers = new Headers();
    const query: Record<string, unknown> = {};
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
    const query: Record<string, unknown> = {};
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
    const query: Record<string, unknown> = {};
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
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets an API key in a cookie', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers = new Headers();
    const query: Record<string, unknown> = {};
    await setAuthParams({
      auth,
      headers,
      query,
      security: [
        {
          in: 'cookie',
          name: 'baz',
          type: 'apiKey',
        },
      ],
    });
    expect(auth).toHaveBeenCalled();
    expect(headers.get('Cookie')).toContain('baz=foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets first scheme only', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers = new Headers();
    const query: Record<string, unknown> = {};
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
    expect(query.baz).toBeUndefined();
  });

  it('sets first scheme with token', async () => {
    const auth = vi.fn().mockImplementation((auth: Auth) => {
      if (auth.type === 'apiKey') {
        return;
      }
      return 'foo';
    });
    const headers = new Headers();
    const query: Record<string, unknown> = {};
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

  it('sets only one specific header', async () => {
    const auth = vi.fn(({ name }: Auth) => {
      if (name === 'baz') {
        return 'foo';
      }
      return 'buz';
    });
    const headers = new Headers();
    const query: Record<string, unknown> = {};
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
          name: 'fiz',
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
    expect(headers.get('fiz')).toBe('buz');
    expect(Object.keys(query).length).toBe(0);
  });
});
