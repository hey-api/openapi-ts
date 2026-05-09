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

  const getConfig = (): Config => ({
    ..._config,
  });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);

    return getConfig();
  };

  const interceptors = createInterceptors<Request, Response, unknown, ResolvedRequestOptions>();

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

    // 🔐 security
    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security,
      });
    }

    // ✅ request validation
    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    // ✅ serialize body
    if (opts.body && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body) as string;
    }

    // ✅ remove content-type if empty body
    if (opts.body === undefined || opts.serializedBody === '') {
      opts.headers.delete('Content-Type');
    }

    return opts as typeof opts & ResolvedRequestOptions<TResponseStyle, ThrowOnError, Url>;
  };

  // @ts-expect-error
  const request: Client['request'] = async (options) => {
    const throwOnError = options.throwOnError ?? _config.throwOnError;

    const responseStyle = options.responseStyle ?? _config.responseStyle;

    let requestObj: Request | undefined;

    let request: Request | undefined;

    let response: Response | undefined;

    try {
      const opts = await beforeRequest(options);

      // ✅ FIXED no-unused-vars
      const optsWithoutBody = Object.fromEntries(
        Object.entries(opts).filter(([key]) => key !== 'body'),
      );

      requestObj = new Request('http://localhost', {
        ...(optsWithoutBody as RequestInit),
        headers: opts.headers,
      });

      // ✅ request interceptors
      for (const fn of interceptors.request.fns) {
        if (fn) {
          requestObj = await fn(requestObj, opts);
        }
      }

      const url = buildUrl(opts);

      const requestInit: ReqInit = {
        body: getValidRequestBody(opts) as BodyInit | null,

        headers: opts.headers,

        redirect: 'follow',
      };

      request = new Request(url, requestInit);

      response = await (opts.fetch ?? globalThis.fetch)(request);

      // ✅ response interceptors
      for (const fn of interceptors.response.fns) {
        if (fn) {
          response = await fn(response, request, opts);
        }
      }

      const result = {
        request,
        response,
      };

      // =========================
      // ✅ SUCCESS HANDLING
      // =========================

      if (response.ok) {
        const parseAs =
          (opts.parseAs === 'auto'
            ? getParseAs(response.headers.get('Content-Type'))
            : opts.parseAs) ?? 'json';

        // ✅ no content response
        if (response.status === 204) {
          return responseStyle === 'data'
            ? {}
            : {
                data: {},
                ...result,
              };
        }

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
            return responseStyle === 'data'
              ? response.body
              : {
                  data: response.body,
                  ...result,
                };

          case 'json':
          default: {
            const text = await response.text();

            data = text ? JSON.parse(text) : {};

            // ✅ validate response
            if (opts.responseValidator) {
              await opts.responseValidator(data);
            }

            // ✅ transform response
            if (opts.responseTransformer) {
              data = await opts.responseTransformer(data);
            }

            break;
          }
        }

        return responseStyle === 'data'
          ? data
          : {
              data,
              ...result,
            };
      }

      // =========================
      // ❌ ERROR HANDLING
      // =========================

      const textError = await response.text();

      let error: unknown;

      try {
        error = JSON.parse(textError);
      } catch {
        // ignore invalid json
        error = textError;
      }

      throw error;
    } catch (error) {
      let finalError = error;

      // ✅ error interceptors
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

  const makeMethodFn = (method: Uppercase<HttpMethod>) => (options: RequestOptions) =>
    request({
      ...options,
      method,
    });

  const makeSseFn = (method: Uppercase<HttpMethod>) => async (options: RequestOptions) => {
    const opts = await beforeRequest(options);

    return createSseClient({
      ...opts,

      body: getValidRequestBody(opts) as BodyInit | null,

      method,

      onRequest: async (url, init) => {
        let req = new Request(url, init);

        for (const fn of interceptors.request.fns) {
          if (fn) {
            req = await fn(req, opts);
          }
        }

        return req;
      },

      url: buildUrl(opts),
    });
  };

  const _buildUrl: Client['buildUrl'] = (options) =>
    buildUrl({
      ..._config,
      ...options,
    });

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

      delete: makeSseFn('DELETE'),

      get: makeSseFn('GET'),

      head: makeSseFn('HEAD'),

      options: makeSseFn('OPTIONS'),

      patch: makeSseFn('PATCH'),

      post: makeSseFn('POST'),

      put: makeSseFn('PUT'),

      trace: makeSseFn('TRACE'),
    },

    trace: makeMethodFn('TRACE'),
  } as Client;
};
