import { createSseClient } from '../../client-core/bundle/serverSentEvents';
import type { HttpMethod } from '../../client-core/bundle/types';
import { getValidRequestBody } from '../../client-core/bundle/utils';
import type { Client, Config, RequestOptions, ResolvedRequestOptions } from './types';
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

  const interceptors = createInterceptors<Response, unknown, ResolvedRequestOptions>();

  const beforeRequest = async <
    TData = unknown,
    ThrowOnError extends boolean = boolean,
    Url extends string = string,
  >(
    options: RequestOptions<TData, ThrowOnError, Url>,
  ) => {
    const opts = {
      ..._config,
      ...options,
      fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
      headers: mergeHeaders(_config.headers, options.headers),
      serializedBody: undefined as string | undefined,
    };

    if (opts.security) {
      await setAuthParams({ ...opts, security: opts.security });
    }

    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    if (opts.body !== undefined && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body) as string | undefined;
    }

    if (opts.body === undefined || opts.serializedBody === '') {
      opts.headers.delete('Content-Type');
    }

    return {
      opts: opts as typeof opts & ResolvedRequestOptions<ThrowOnError, Url>,
    };
  };

  const request: Client['request'] = async (options) => {
    const throwOnError = options.throwOnError ?? _config.throwOnError;

    let response: Response | undefined;

    try {
      const { opts } = await beforeRequest(options);

      // request interceptors
      for (const fn of interceptors.request.fns) {
        if (fn) await fn(opts);
      }

      const url = buildUrl(opts);

      const _fetch = opts.fetch!;
      const requestInit: ReqInit = {
        ...opts,
        body: getValidRequestBody(opts),
      };

      response = await _fetch(url, requestInit);

      // response interceptors
      for (const fn of interceptors.response.fns) {
        if (fn) response = await fn(response, opts);
      }

      const result = { response };

      if (response.ok) {
        const parseAs =
          (opts.parseAs === 'auto'
            ? getParseAs(response.headers.get('Content-Type'))
            : opts.parseAs) ?? 'json';

        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
          let emptyData: any = {};

          switch (parseAs) {
            case 'arrayBuffer':
            case 'blob':
            case 'text':
              emptyData = await response[parseAs]();
              break;
            case 'formData':
              emptyData = new FormData();
              break;
            case 'stream':
              emptyData = response.body;
              break;
          }

          return { data: emptyData, ...result };
        }

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
            return { data: response.body, ...result };
        }

        if (parseAs === 'json') {
          if (opts.responseValidator) await opts.responseValidator(data);
          if (opts.responseTransformer) data = await opts.responseTransformer(data);
        }

        return { data, ...result };
      }

      const textError = await response.text();
      let jsonError: unknown;

      try {
        jsonError = JSON.parse(textError);
      } catch {
        // ignore JSON parse error
      }

      throw jsonError ?? textError;
    } catch (error) {
      let finalError = error;

      for (const fn of interceptors.error.fns) {
        if (fn) {
          finalError = await fn(finalError, response, options as ResolvedRequestOptions);
        }
      }

      if (throwOnError) throw finalError;

      return { error: finalError || {}, response };
    }
  };

  const makeMethodFn = (method: Uppercase<HttpMethod>) => (options: RequestOptions) =>
    request({ ...options, method });

  const makeSseFn = (method: Uppercase<HttpMethod>) => async (options: RequestOptions) => {
    const { opts } = await beforeRequest(options);

    return createSseClient({
      ...opts,
      body: opts.body as BodyInit | null | undefined,
      method,

      onRequest: async (_unusedUrl, init) => {
        const clonedOpts = { ...opts };

        for (const fn of interceptors.request.fns) {
          if (fn) await fn(clonedOpts);
        }

        const finalizedUrl = buildUrl(clonedOpts);
        return new Request(finalizedUrl, init);
      },

      serializedBody: getValidRequestBody(opts) as BodyInit | null | undefined,
    });
  };

  const _buildUrl: Client['buildUrl'] = (options) => buildUrl({ ..._config, ...options });

  return {
    buildUrl: _buildUrl,
    connect: makeMethodFn('CONNECT'),

    delete: makeMethodFn('DELETE'),
    get: makeMethodFn('GET'),
    getConfig,
    head: makeMethodFn('HEAD'),
    interceptors,
    options: makeMethodFn('OPTIONS'),
    patch: makeMethodFn('PATCH'),
    post: makeMethodFn('POST'),
    put: makeMethodFn('PUT'),
    request,
    setConfig,
    sse: {
      connect: makeSseFn('CONNECT'),
      delete: makeMethodFn('DELETE'),
      get: makeMethodFn('GET'),
      head: makeMethodFn('HEAD'),
      options: makeMethodFn('OPTIONS'),
      patch: makeMethodFn('PATCH'),
      post: makeMethodFn('POST'),
      put: makeMethodFn('PUT'),
      trace: makeMethodFn('TRACE'),
    },
    trace: makeMethodFn('TRACE'),
  } as unknown as Client;
};
