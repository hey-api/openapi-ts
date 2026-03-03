import type { Auth } from '../../client-core/bundle/auth';
import { mergeInterceptors, setAuthParams, unwrapRefs } from '../bundle/utils';

describe('unwrapRefs', () => {
  it('returns Blob as-is', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const result = unwrapRefs(blob);
    expect(result).toBe(blob);
  });

  it('preserves Blob in object', () => {
    const blob = new Blob(['test content'], { type: 'application/json' });
    const input = { file: blob, name: 'test' };
    const result = unwrapRefs(input);
    expect(result.file).toBe(blob);
    expect(result.name).toBe('test');
  });

  it('preserves Blob in array', () => {
    const blob = new Blob(['test content'], { type: 'image/png' });
    const input = [blob, 'text'];
    const result = unwrapRefs(input);
    expect(result[0]).toBe(blob);
    expect(result[1]).toBe('text');
  });

  it('preserves File (extends Blob) as-is', () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const result = unwrapRefs(file);
    expect(result).toBe(file);
  });
});

describe('mergeInterceptors', () => {
  it('handles no arguments', () => {
    const result = mergeInterceptors();
    expect(result).toEqual([]);
  });

  it('handles interceptor function', () => {
    const foo = () => {};
    const result = mergeInterceptors(foo);
    expect(result).toEqual([foo]);
  });

  it('handles interceptors array', () => {
    const foo = [() => {}];
    const result = mergeInterceptors(foo);
    expect(result).toEqual([foo[0]]);
  });

  it('handles interceptors array and function', () => {
    const foo = [() => {}, () => {}];
    const bar = () => {};
    const result = mergeInterceptors(foo, bar);
    expect(result).toEqual([foo[0], foo[1], bar]);
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

  it('sets only one specific header', async () => {
    const auth = vi.fn(({ name }: Auth) => {
      if (name === 'baz') {
        return 'foo';
      }
      return 'buz';
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
