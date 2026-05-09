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
  body?: BodyInit | null;
  headers: Headers;
};

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    return getConfig();
  };

  const interceptors =
    createInterceptors<Request, Response, unknown, ResolvedRequestOptions>();

  const beforeRequest = async <
    TData = unknown,
    TResponseStyle extends 'data' | 'fields' = 'fields',
    ThrowOnError extends boolean = boolean,
    Url extends string = string,
  >(
    options: RequestOptions<TData, TResponseStyle, ThrowOnError, Url>,
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

    if (opts.body && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body) as string;
    }

    if (opts.body === undefined || opts.serializedBody === '') {
      opts.headers.delete('Content-Type');
    }

    return opts as typeof opts & ResolvedRequestOptions<TResponseStyle, ThrowOnError, Url>;
  };

  const request: Client['request'] = async (options) => {
    const throwOnError = options.throwOnError ?? _config.throwOnError;
    const responseStyle = options.responseStyle ?? _config.responseStyle;

    let requestObj: Request | undefined;
    let request: Request | undefined;
    let response: Response | undefined;

    try {
      const opts = await beforeRequest(options);

      //  FIX: no any, safe destructuring
      const { body, ...optsWithoutBody } = opts;

      requestObj = new Request('http://localhost', {
        ...(optsWithoutBody as RequestInit),
        headers: opts.headers,
      });

      for (const fn of interceptors.request.fns) {
        if (fn) {
          requestObj = await fn(requestObj, opts);
        }
      }

      const url = buildUrl(opts);

      const requestInit: ReqInit = {
        redirect: 'follow',
        headers: opts.headers,
        body: getValidRequestBody(opts) as BodyInit | null,
      };

      request = new Request(url, requestInit);

      response = await (opts.fetch ?? globalThis.fetch)(request);

      for (const fn of interceptors.response.fns) {
        if (fn) {
          response = await fn(response, request, opts);
        }
      }

      const result = { request, response };

      if (response.ok) {
        const parseAs =
          (opts.parseAs === 'auto'
            ? getParseAs(response.headers.get('Content-Type'))
            : opts.parseAs) ?? 'json';

        if (response.status === 204) {
          return responseStyle === 'data'
            ? {}
            : { data: {}, ...result };
        }

        let data: any;

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
            return responseStyle === 'data'
              ? response.body
              : { data: response.body, ...result };
          default: {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
          }
        }

        if (parseAs === 'json') {
          await opts.responseValidator?.(data);
          if (opts.responseTransformer) {
            data = await opts.responseTransformer(data);
          }
        }

        return responseStyle === 'data'
          ? data
          : { data, ...result };
      }

      const textError = await response.text();

      let error: unknown;
      try {
        error = JSON.parse(textError);
      } catch {
        error = textError;
      }

      throw error;
    } catch (error) {
      let finalError = error;

      for (const fn of interceptors.error.fns) {
        if (fn) {
          finalError = await fn(finalError, response, request, options as any);
        }
      }

      if (throwOnError) {
        throw finalError;
      }

      return responseStyle === 'data'
        ? undefined
        : {
            error: finalError,
            request,
            response,
          };
    }
  };

  const makeMethodFn =
    (method: Uppercase<HttpMethod>) =>
    (options: RequestOptions) =>
      request({ ...options, method });

  const makeSseFn =
    (method: Uppercase<HttpMethod>) =>
    async (options: RequestOptions) => {
      const opts = await beforeRequest(options);

      return createSseClient({
        ...opts,
        method,
        body: getValidRequestBody(opts) as BodyInit | null,
        url: buildUrl(opts),
        onRequest: async (url, init) => {
          let req = new Request(url, init);
          for (const fn of interceptors.request.fns) {
            if (fn) req = await fn(req, opts);
          }
          return req;
        },
      });
    };

  const _buildUrl: Client['buildUrl'] = (options) =>
    buildUrl({ ..._config, ...options });

  return {
    buildUrl: _buildUrl,
    connect: makeMethodFn('CONNECT'),
    delete: makeMethodFn('DELETE'),
    get: makeMethodFn('GET'),
    head: makeMethodFn('HEAD'),
    options: makeMethodFn('OPTIONS'),
    patch: makeMethodFn('PATCH'),
    post: makeMethodFn('POST'),
    put: makeMethodFn('PUT'),
    trace: makeMethodFn('TRACE'),
    request,
    interceptors,
    getConfig,
    setConfig,
    sse: {
      connect: makeSseFn('CONNECT'),
      delete: makeSseFn('DELETE'),
      get: makeSseFn('GET'),
      head: makeSseFn('HEAD'),
      options: makeSseFn('OPTIONS'),
      patch: makeSseFn('PATCH'),
      post: makeSseFn('POST'),
      put: makeSseFn('PUT'),
      trace: makeSseFn('TRACE'),
    },
  } as Client;
};