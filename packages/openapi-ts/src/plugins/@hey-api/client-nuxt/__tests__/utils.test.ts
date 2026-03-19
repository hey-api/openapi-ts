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

  it('returns AbortSignal as-is', () => {
    const controller = new AbortController();
    const result = unwrapRefs(controller.signal);
    expect(result).toBe(controller.signal);
  });

  it('preserves AbortSignal in object', () => {
    const controller = new AbortController();
    const input = { signal: controller.signal, url: '/test' };
    const result = unwrapRefs(input);
    expect(result.signal).toBe(controller.signal);
    expect(result.signal instanceof AbortSignal).toBe(true);
    expect(result.url).toBe('/test');
  });

  it('returns FormData as-is', () => {
    const formData = new FormData();
    formData.append('key', 'value');
    const result = unwrapRefs(formData);
    expect(result).toBe(formData);
  });

  it('preserves FormData in object', () => {
    const formData = new FormData();
    formData.append('key', 'value');
    const input = { body: formData, url: '/upload' };
    const result = unwrapRefs(input);
    expect(result.body).toBe(formData);
    expect(result.body instanceof FormData).toBe(true);
  });

  it('returns ReadableStream as-is', () => {
    const stream = new ReadableStream();
    const result = unwrapRefs(stream);
    expect(result).toBe(stream);
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
