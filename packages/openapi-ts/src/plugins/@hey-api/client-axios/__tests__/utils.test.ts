import { describe, expect, it, vi } from 'vitest';

import type { Auth } from '../../client-core/bundle/auth';
import {
  axiosHeadersKeywords,
  mergeHeaders,
  setAuthParams,
} from '../bundle/utils';

describe('mergeHeaders', () => {
  it.each(axiosHeadersKeywords)(
    'handles "%s" Axios special keyword',
    (keyword) => {
      const headers = mergeHeaders(
        {
          foo: 'foo',
        },
        {
          [keyword]: {
            foo: 'foo',
          },
        },
      );
      expect(headers).toEqual({
        foo: 'foo',
        [keyword]: {
          foo: 'foo',
        },
      });
    },
  );
});

describe('setAuthParams', () => {
  it('sets bearer token in headers', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers: Record<any, unknown> = {};
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
    expect(headers.baz).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets access token in query', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers: Record<any, unknown> = {};
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
    expect(headers.baz).toBeUndefined();
    expect(query.baz).toBe('Bearer foo');
  });

  it('sets Authorization header when `in` and `name` are undefined', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers: Record<any, unknown> = {};
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
    expect(headers.Authorization).toBe('foo');
    expect(query).toEqual({});
  });

  it('sets an API key in a cookie', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers: Record<any, unknown> = {};
    const query: Record<any, unknown> = {};
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
    expect(headers.Cookie).toBe('baz=foo');
    expect(query).toEqual({});
  });

  it('sets first scheme only', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const headers: Record<any, unknown> = {};
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
    expect(headers.baz).toBe('Bearer foo');
    expect(Object.keys(query).length).toBe(0);
  });

  it('sets first scheme with token', async () => {
    const auth = vi.fn().mockImplementation((auth: Auth) => {
      if (auth.type === 'apiKey') {
        return;
      }
      return 'foo';
    });
    const headers: Record<any, unknown> = {};
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
    expect(headers.baz).toBeUndefined();
    expect(query.baz).toBe('Bearer foo');
  });

  it('sets only one specific header', async () => {
    const auth = vi.fn(({ name }: Auth) => {
      if (name === 'baz') {
        return 'foo';
      }
      return 'buz';
    });
    const headers: Record<any, unknown> = {};
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
    expect(headers['baz']).toBe('Bearer foo');
    expect(headers['fiz']).toBe('buz');
    expect(Object.keys(query).length).toBe(0);
  });
});
