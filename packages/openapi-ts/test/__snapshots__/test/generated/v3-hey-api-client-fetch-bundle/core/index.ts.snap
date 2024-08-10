import type { Client, Config, RequestOptions } from './types';
import {
  createConfig,
  createInterceptors,
  createQuerySerializer,
  getParseAs,
  getUrl,
  mergeConfigs,
  mergeHeaders,
} from './utils';

type ReqInit = Omit<RequestInit, 'body' | 'headers'> & {
  body?: any;
  headers: ReturnType<typeof mergeHeaders>;
};

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    return getConfig();
  };

  const interceptors = createInterceptors<Request, Response, RequestOptions>();

  // @ts-ignore
  const request: Client['request'] = async (options) => {
    // @ts-ignore
    const opts: RequestOptions = {
      ..._config,
      ...options,
      headers: mergeHeaders(_config.headers, options.headers),
    };
    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (!opts.body) {
      opts.headers.delete('Content-Type');
    }

    const url = getUrl({
      baseUrl: opts.baseUrl ?? '',
      path: opts.path,
      query: opts.query,
      querySerializer:
        typeof opts.querySerializer === 'function'
          ? opts.querySerializer
          : createQuerySerializer(opts.querySerializer),
      url: opts.url,
    });

    const requestInit: ReqInit = {
      redirect: 'follow',
      ...opts,
    };

    let request = new Request(url, requestInit);

    for (const fn of interceptors.request._fns) {
      request = await fn(request, opts);
    }

    const _fetch = opts.fetch!;
    let response = await _fetch(request);

    for (const fn of interceptors.response._fns) {
      response = await fn(response, request, opts);
    }

    const result = {
      request,
      response,
    };

    if (response.ok) {
      if (
        response.status === 204 ||
        response.headers.get('Content-Length') === '0'
      ) {
        return {
          data: {},
          ...result,
        };
      }

      if (opts.parseAs === 'stream') {
        return {
          data: response.body,
          ...result,
        };
      }

      const parseAs =
        (opts.parseAs === 'auto'
          ? getParseAs(response.headers.get('Content-Type'))
          : opts.parseAs) ?? 'json';

      let data = await response[parseAs]();
      if (parseAs === 'json' && opts.responseTransformer) {
        data = await opts.responseTransformer(data);
      }

      return {
        data,
        ...result,
      };
    }

    let error = await response.text();

    if (opts.throwOnError) {
      throw new Error(error);
    }

    try {
      error = JSON.parse(error);
    } catch {
      // noop
    }
    return {
      error: error || {},
      ...result,
    };
  };

  return {
    connect: (options) => request({ ...options, method: 'CONNECT' }),
    delete: (options) => request({ ...options, method: 'DELETE' }),
    get: (options) => request({ ...options, method: 'GET' }),
    getConfig,
    head: (options) => request({ ...options, method: 'HEAD' }),
    interceptors,
    options: (options) => request({ ...options, method: 'OPTIONS' }),
    patch: (options) => request({ ...options, method: 'PATCH' }),
    post: (options) => request({ ...options, method: 'POST' }),
    put: (options) => request({ ...options, method: 'PUT' }),
    request,
    setConfig,
    trace: (options) => request({ ...options, method: 'TRACE' }),
  } as Client;
};
