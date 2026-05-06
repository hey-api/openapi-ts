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

  const interceptors = createInterceptors<Request, Response, unknown, RequestOptions>();

  // @ts-expect-error
  const request: Client['request'] = async (options) => {
    const opts = {
      ..._config,
      ...options,
      fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
      headers: mergeHeaders(_config.headers, options.headers),
    };

    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security,
      });
    }

    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (opts.body === undefined || opts.body === '') {
      opts.headers.delete('Content-Type');
    }

    const requestInit: ReqInit = {
      redirect: 'follow',
      ...opts,
    };

    /**
     * FIX (#3803): Execute request interceptors before building the final URL.
     * This ensures that any mutations made to 'opts' (e.g., baseUrl, path, query)
     * by the interceptors are correctly captured during the URL construction phase.
     */

    // 1. Create an initial Request object with a placeholder URL
    let request = new Request('' as string, requestInit);

    // 2. Process all registered request interceptors
    for (const fn of interceptors.request.fns) {
      if (fn) {
        request = await fn(request, opts);
      }
    }

    // 3. Construct the final URL using the potentially modified options
    const url = buildUrl(opts);

    // 4. Re-initialize the Request object with the final computed URL and original init options
    request = new Request(url, requestInit);

    // fetch must be assigned here, otherwise it would throw the error:
    // TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation
    const _fetch = opts.fetch!;
    let response = await _fetch(request);

    for (const fn of interceptors.response.fns) {
      if (fn) {
        response = await fn(response, request, opts);
      }
    }

    const result = {
      request,
      response,
    };

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
          : opts.parseAs) ?? 'json';

      let data: any;
      switch (parseAs) {
        case 'arrayBuffer':
        case 'blob':
        case 'formData':
        case 'text':
          data = await response[parseAs]();
          break;
        case 'json': {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
          break;
        }
        case 'stream':
          return {
            data: response.body,
            ...result,
          };
      }
      if (parseAs === 'json') {
        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }

        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
      }

      return {
        data,
        ...result,
      };
    }

    let error = await response.text();

    try {
      error = JSON.parse(error);
    } catch {
      // noop
    }

    /**
     * FIX (#3803): Implementing proper error interceptor threading.
     * Ensure each error interceptor receives the result of the previous one.
     */
    let finalError = error;

    for (const fn of interceptors.error.fns) {
      if (fn) {
        finalError = (await fn(finalError, response, request, opts)) as string;
      }
    }

    finalError = finalError || ({} as string);

    if (opts.throwOnError) {
      throw finalError;
    }

    return {
      error: finalError,
      ...result,
    };
  };

  return {
    buildUrl,
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
  };
};
