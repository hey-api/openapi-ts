import type { AxiosInstance } from 'axios';
import axios from 'axios';

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
    expect((client.instance.interceptors.request as any).handlers.length).toBe(1);
  });
});

describe('unserialized request body handling', () => {
  const client = createClient({ baseURL: 'https://example.com' });

  const scenarios = [{ body: 0 }, { body: false }, { body: 'test string' }, { body: '' }];

  it.each(scenarios)('handles plain text body with $body value', async ({ body }) => {
    const mockAxios = vi.fn();

    await client.post({
      axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
      body,
      bodySerializer: null,
      headers: {
        'Content-Type': 'text/plain',
      },
      url: '/test',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: body,
      }),
    );
  });
});

describe('serialized request body handling', () => {
  const client = createClient({ baseURL: 'https://example.com' });

  const scenarios = [
    {
      body: '',
      expectBodyValue: false,
      serializedBody: '',
    },
    {
      body: 0,
      expectBodyValue: true,
      serializedBody: 0,
    },
    {
      body: false,
      expectBodyValue: true,
      serializedBody: false,
    },
    {
      body: {},
      expectBodyValue: true,
      serializedBody: '{"key":"value"}',
    },
  ];

  it.each(scenarios)(
    'handles $serializedBody serializedBody value',
    async ({ body, expectBodyValue, serializedBody }) => {
      const mockAxios = vi.fn();

      await client.post({
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        body,
        bodySerializer: () => serializedBody,
        headers: {
          'Content-Type': 'application/json',
        },
        url: '/test',
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectBodyValue ? serializedBody : null,
        }),
      );
    },
  );
});

describe('calling axios instance', () => {
  it.each([
    {
      description: 'with absolute baseURL',
      expectedURL: 'https://api.example.com/users',
      instanceBaseURL: 'https://api.example.com',
      optionsURL: '/users',
    },
    {
      description: 'without baseURL',
      expectedURL: '/users',
      instanceBaseURL: undefined,
      optionsURL: '/users',
    },
    {
      description: 'with relative baseURL',
      expectedURL: '/some-base-url/users',
      instanceBaseURL: '/some-base-url',
      optionsURL: '/users',
    },
  ])(
    'should call the axios instance with correct baseURL and url $description configured via createClient',
    async ({ expectedURL, instanceBaseURL, optionsURL }) => {
      const client = createClient({ baseURL: instanceBaseURL });
      const mockAxios = vi.fn().mockResolvedValue({ data: { ok: true } });

      const options = {
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        headers: {},
        url: optionsURL,
      };

      await client.get(options);

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '',
          url: expectedURL,
        }),
      );
    },
  );

  it.each([
    {
      description: 'with absolute baseURL',
      expectedURL: 'https://api.example.com/some-base-url/users',
      optionsBaseURL: 'https://api.example.com/some-base-url',
      optionsURL: '/users',
    },
    {
      description: 'with relative baseURL',
      expectedURL: '/some-base-url/users',
      optionsBaseURL: '/some-base-url',
      optionsURL: '/users',
    },
  ])(
    'should call the axios instance with correct url $description configured via request options',
    async ({ expectedURL, optionsBaseURL, optionsURL }) => {
      const client = createClient({
        baseURL: 'base-url-that-will-be-overridden',
      });

      const mockAxios = vi.fn().mockResolvedValue({ data: { ok: true } });

      const options = {
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        baseURL: optionsBaseURL,
        headers: {},
        url: optionsURL,
      };

      await client.get(options);

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '',
          url: expectedURL,
        }),
      );
    },
  );

  it('should call the axios instance with correct url when baseURL configured via axios defaults', async () => {
    const client = createClient();

    const mockAxios = vi.fn().mockResolvedValue({
      data: { ok: true },
    }) as Partial<AxiosInstance> as AxiosInstance;
    mockAxios.defaults = { baseURL: '/some-base-url', headers: {} as any };

    const options = {
      axios: mockAxios,
      headers: {},
      url: '/users',
    };

    await client.get(options);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '',
        url: '/some-base-url/users',
      }),
    );
  });

  it('should prefer passed baseUrl over configs', async () => {
    const client = createClient({ baseURL: 'base-url-from-config-1' });

    const mockAxios = vi.fn().mockResolvedValue({
      data: { ok: true },
    }) as Partial<AxiosInstance> as AxiosInstance;
    mockAxios.defaults = {
      baseURL: 'base-url-from-config-2',
      headers: {} as any,
    };

    const options = {
      axios: mockAxios,
      baseURL: '/some-base-url',
      headers: {},
      url: '/users',
    };

    await client.get(options);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '',
        url: '/some-base-url/users',
      }),
    );
  });
});

// TODO: remove this after confirmation
describe('confirming axios behaviour for constructing URLs', () => {
  it('resolves relative URLs against baseURL', async () => {
    const client = axios.create({
      baseURL: 'https://api.example.com',
    });

    const config = client.getUri({ url: '/users' });
    expect(config).toBe('https://api.example.com/users');
  });

  it('resolves relative URLs against relative baseURL', async () => {
    const client = axios.create({
      baseURL: '/example',
    });

    const config = client.getUri({ url: '/users' });
    expect(config).toBe('/example/users');
  });

  it('does not prepend baseURL when url is absolute', async () => {
    const client = axios.create({
      baseURL: 'https://api.example.com',
    });

    const config = client.getUri({ url: 'https://other.com/users' });
    expect(config).toBe('https://other.com/users');
  });

  it('does not prepend baseURL when overriding baseURL with empty string', async () => {
    const client = axios.create({
      baseURL: 'https://api.example.com',
    });

    const config = client.getUri({ baseURL: '', url: '/users' });
    expect(config).toBe('/users');
  });

  it('does prepend baseURL when overriding baseURL with undefined', async () => {
    const client = axios.create({
      baseURL: 'https://api.example.com',
    });

    const config = client.getUri({ baseURL: undefined, url: '/users' });
    expect(config).toBe('https://api.example.com/users');
  });
});

describe('error handling', () => {
  it('should handle 404 response when throwOnError is false', async () => {
    const client = createClient({ baseURL: 'https://api.example.com' });

    const errorData = { error: 'Resource not found' };
    const axiosError = new axios.AxiosError(
      'Request failed with status code 404',
      'ERR_BAD_REQUEST',
      {} as any,
      {},
      {
        config: {} as any,
        data: errorData,
        headers: {},
        status: 404,
        statusText: 'Not Found',
      },
    );

    const mockAxios = vi.fn().mockResolvedValue(axiosError);

    const result = await client.get({
      axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
      headers: {},
      throwOnError: false,
      url: '/users/999',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users/999',
      }),
    );
    expect(result).toBeInstanceOf(axios.AxiosError);
    expect(result).toMatchObject({
      error: errorData,
      response: {
        data: errorData,
        status: 404,
        statusText: 'Not Found',
      },
    });
  });

  it('should throw 404 error when throwOnError is true', async () => {
    const client = createClient({ baseURL: 'https://api.example.com' });

    const errorData = { error: 'Resource not found' };
    const axiosError = new axios.AxiosError(
      'Request failed with status code 404',
      'ERR_BAD_REQUEST',
      {} as any,
      {},
      {
        config: {} as any,
        data: errorData,
        headers: {},
        status: 404,
        statusText: 'Not Found',
      },
    );

    const mockAxios = vi.fn().mockResolvedValue(axiosError);

    await expect(
      client.get({
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        headers: {},
        throwOnError: true,
        url: '/users/999',
      }),
    ).rejects.toMatchObject({
      response: {
        data: errorData,
        status: 404,
        statusText: 'Not Found',
      },
    });
  });

  it('should handle ECONNREFUSED error when throwOnError is false', async () => {
    const client = createClient({ baseURL: 'https://api.example.com' });

    const connectionError = axios.AxiosError.from(
      new AggregateError(
        [
          new Error('connect ECONNREFUSED ::1:3000'),
          new Error('connect ECONNREFUSED 127.0.0.1:3000'),
        ],
        'Error',
      ),
      'ECONNREFUSED',
      {} as any,
      {},
      undefined, // no response object for connection errors
    );

    const mockAxios = vi.fn().mockResolvedValue(connectionError);

    const result = await client.get({
      axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
      headers: {},
      throwOnError: false,
      url: '/users',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users',
      }),
    );
    expect(result).toMatchObject({
      code: 'ECONNREFUSED',
      error: {}, // error.response?.data ?? {}
      message: 'Error',
    });
  });

  it('should throw ECONNREFUSED error when throwOnError is true', async () => {
    const client = createClient({ baseURL: 'https://api.example.com' });

    const connectionError = axios.AxiosError.from(
      new AggregateError(
        [
          new Error('connect ECONNREFUSED ::1:3000'),
          new Error('connect ECONNREFUSED 127.0.0.1:3000'),
        ],
        'Error',
      ),
      'ECONNREFUSED',
      {} as any,
      {},
      undefined,
    );

    const mockAxios = vi.fn().mockResolvedValue(connectionError);

    await expect(
      client.get({
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        headers: {},
        throwOnError: true,
        url: '/users',
      }),
    ).rejects.toMatchObject({
      code: 'ECONNREFUSED',
      message: 'Error',
      name: 'AggregateError',
    });
  });

  it('should handle non-object error from responseValidator when throwOnError is false', async () => {
    const client = createClient({ baseURL: 'https://api.example.com' });

    const mockAxios = vi.fn().mockResolvedValue({
      data: { id: 1, name: 'test' },
      headers: {},
      status: 200,
      statusText: 'OK',
    });

    const result = await client.get({
      axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
      headers: {},
      responseType: 'json',
      responseValidator: vi.fn().mockRejectedValue('validation failed'),
      throwOnError: false,
      url: '/users/1',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users/1',
      }),
    );
    expect(result).toEqual({
      error: {},
    });
  });

  it('should throw non-object error from responseValidator when throwOnError is true', async () => {
    const client = createClient({ baseURL: 'https://api.example.com' });

    const mockAxios = vi.fn().mockResolvedValue({
      data: { id: 1, name: 'test' },
      headers: {},
      status: 200,
      statusText: 'OK',
    });

    await expect(
      client.get({
        axios: mockAxios as Partial<AxiosInstance> as AxiosInstance,
        headers: {},
        responseType: 'json',
        responseValidator: vi.fn().mockRejectedValue('non-object error'),
        throwOnError: true,
        url: '/users/1',
      }),
    ).rejects.toBe('non-object error');
  });
});
