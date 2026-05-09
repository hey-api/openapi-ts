import type { Client, Config, RequestOptions } from './types';
import {
  buildUrl,
  createConfig,
  createInterceptors,
  getParseAs,
  mergeConfigs,
  mergeHeaders,
  setAuthParams,
} from './utils';

type ReqInit = Omit<RequestInit, 'body' | 'headers'> & {
  body?: BodyInit | null;
  headers: ReturnType<typeof mergeHeaders>;
};

type ParseAs = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'stream';

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    return getConfig();
  };

  const interceptors = createInterceptors<Request, Response, unknown, RequestOptions>();

  // @ts-expect-error
  const request: Client['request'] = async (options) => {
    const opts = {
      ..._config,
      ...options,
      fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
      headers: mergeHeaders(_config.headers, options.headers),
    };

    // security
    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security,
      });
    }

    // request validator
    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    // serialize body
    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    // remove content-type if empty body
    if (opts.body === undefined || opts.body === '') {
      opts.headers.delete('Content-Type');
    }

    let requestObj = new Request('http://localhost', {
      ...(opts as RequestInit),
      headers: opts.headers,
    });

    // request interceptors
    for (const fn of interceptors.request.fns) {
      if (fn) {
        requestObj = await fn(requestObj, opts);
      }
    }

    const url = buildUrl(opts);

    const requestInit: ReqInit = {
      redirect: 'follow',
      ...(opts as Omit<typeof opts, 'body'>),
      body: opts.body as BodyInit | null | undefined,
    };

    const finalRequest = new Request(url, requestInit);

    const response = await opts.fetch!(finalRequest);

    const result = {
      request: finalRequest,
      response,
    };

    // response interceptors
    for (const fn of interceptors.response.fns) {
      if (fn) {
        await fn(response, finalRequest, opts);
      }
    }

    // SUCCESS HANDLING
    if (response.ok) {
      if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return {
          data: {},
          ...result,
        };
      }

      const parseAs =
        (opts.parseAs === 'auto'
          ? getParseAs(response.headers.get('Content-Type'))
          : (opts.parseAs as ParseAs)) ?? 'json';

      let data: unknown;

      switch (parseAs) {
        case 'arrayBuffer':
          data = await response.arrayBuffer();
          break;

        case 'blob':
          data = await response.blob();
          break;

        case 'formData':
          data = await response.formData();
          break;

        case 'text':
          data = await response.text();
          break;

        case 'stream':
          return {
            data: response.body ?? null,
            ...result,
          };

        case 'json':
        default: {
          const text = await response.text();

          data = text ? JSON.parse(text) : {};

          if (opts.responseValidator) {
            await opts.responseValidator(data);
          }

          if (opts.responseTransformer) {
            data = await opts.responseTransformer(data);
          }
        }
      }

      return {
        data,
        ...result,
      };
    }

    // ERROR HANDLING
    let error: unknown = await response.text();

    try {
      error = JSON.parse(error as string);
    } catch {
      // ignore JSON parse errors
    }

    let finalError = error;

    for (const fn of interceptors.error.fns) {
      if (fn) {
        finalError = await fn(finalError, response, finalRequest, opts);
      }
    }

    if (opts.throwOnError) {
      throw finalError;
    }

    return {
      error: finalError || {},
      ...result,
    };
  };

  return {
    buildUrl,

    connect: (o) => request({ ...o, method: 'CONNECT' }),

    delete: (o) => request({ ...o, method: 'DELETE' }),

    get: (o) => request({ ...o, method: 'GET' }),

    getConfig,

    head: (o) => request({ ...o, method: 'HEAD' }),

    interceptors,

    options: (o) => request({ ...o, method: 'OPTIONS' }),

    patch: (o) => request({ ...o, method: 'PATCH' }),

    post: (o) => request({ ...o, method: 'POST' }),

    put: (o) => request({ ...o, method: 'PUT' }),

    request,

    setConfig,

    trace: (o) => request({ ...o, method: 'TRACE' }),
  };
};
