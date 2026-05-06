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

    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security,
      });
    }

    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    if (opts.body !== undefined && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body) as string | undefined;
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (opts.body === undefined || opts.serializedBody === '') {
      opts.headers.delete('Content-Type');
    }

    const resolvedOpts = opts as typeof opts &
      ResolvedRequestOptions<TResponseStyle, ThrowOnError, Url>;

    return { opts: resolvedOpts };
  };

  const request: Client['request'] = async (options) => {
    const throwOnError = options.throwOnError ?? _config.throwOnError;
    const responseStyle = options.responseStyle ?? _config.responseStyle;

    let request: Request | undefined;
    let response: Response | undefined;

    try {
      const { opts } = await beforeRequest(options);

      /**
       * Initialize request object with a placeholder URL.
       * The final URL will be constructed after interceptors have finished
       * to allow for potential mutation of opts (baseUrl, query, etc.).
       */
      const requestInit: ReqInit = {
        redirect: 'follow',
        ...opts,
        body: getValidRequestBody(opts),
      };

      request = new Request('' as string, requestInit);

      // 1. Process all request interceptors
      for (const fn of interceptors.request.fns) {
        if (fn) {
          request = await fn(request, opts);
        }
      }

      // 2. Build final URL after interceptors have potentially mutated options
      const url = buildUrl(opts);

      // 3. Re-initialize Request with the finalized computed URL
      request = new Request(url, requestInit);

      // fetch must be assigned here, otherwise it would throw the error:
      // TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation
      const _fetch = opts.fetch!;

      response = await _fetch(request);

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
        const parseAs =
          (opts.parseAs === 'auto'
            ? getParseAs(response.headers.get('Content-Type'))
            : opts.parseAs) ?? 'json';

        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
          let emptyData: any;
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
            case 'json':
            default:
              emptyData = {};
              break;
          }
          return opts.responseStyle === 'data'
            ? emptyData
            : {
                data: emptyData,
                ...result,
              };
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
            // Some servers return 200 with no Content-Length and empty body.
            // response.json() would throw; read as text and parse if non-empty.
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
            break;
          }
          case 'stream':
            return opts.responseStyle === 'data'
              ? response.body
              : {
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

        return opts.responseStyle === 'data'
          ? data
          : {
              data,
              ...result,
            };
      }

      const textError = await response.text();
      let jsonError: unknown;

      try {
        jsonError = JSON.parse(textError);
      } catch {
        // noop
      }

      throw jsonError ?? textError;
    } catch (error) {
      /**
       * Implementation of error interceptor threading.
       * Ensures that each interceptor in the chain receives the processed error
       * from the previous one.
       */
      let finalError = error;

      for (const fn of interceptors.error.fns) {
        if (fn) {
          finalError = await fn(finalError, response, request, options as ResolvedRequestOptions);
        }
      }

      finalError = finalError || {};

      if (throwOnError) {
        throw finalError;
      }

      // TODO: we probably want to return error and improve types
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
    request({ ...options, method });

  const makeSseFn = (method: Uppercase<HttpMethod>) => async (options: RequestOptions) => {
    const { opts } = await beforeRequest(options);

    /**
     * SSE Implementation: Defer URL construction to ensure onRequest
     * interceptors can properly mutate the request flow.
     */
    return createSseClient({
      ...opts,
      body: opts.body as BodyInit | null | undefined,
      method,
      onRequest: async (initialUrl, init) => {
        let request = new Request(initialUrl, init);
        for (const fn of interceptors.request.fns) {
          if (fn) {
            request = await fn(request, opts);
          }
        }

        // Re-build final URL after interceptors to capture mutations
        const finalUrl = buildUrl(opts);
        return new Request(finalUrl, init);
      },
      serializedBody: getValidRequestBody(opts) as BodyInit | null | undefined,
      url: buildUrl(opts),
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
