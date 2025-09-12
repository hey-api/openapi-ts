import {
  toCase,
  transformKeysDeep,
} from '../../client-core/bundle/caseTransform';
import { createSseClient } from '../../client-core/bundle/serverSentEvents';
import type { HttpMethod } from '../../client-core/bundle/types';
import { getValidRequestBody } from '../../client-core/bundle/utils';
import type {
  Client,
  Config,
  RequestOptions,
  ResolvedRequestOptions,
} from './types';
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

  const interceptors = createInterceptors<
    Request,
    Response,
    unknown,
    ResolvedRequestOptions
  >();

  const beforeRequest = async (options: RequestOptions) => {
    const opts = {
      ..._config,
      ...options,
      fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
      headers: mergeHeaders(_config.headers, options.headers),
      serializedBody: undefined,
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
      // Transform request body keys to runtimeCase before serialization
      const targetCase = opts.runtimeCase ?? 'preserve';
      const bodyToSerialize =
        targetCase === 'preserve'
          ? opts.body
          : transformKeysDeep(opts.body, toCase(targetCase));
      opts.serializedBody = opts.bodySerializer(bodyToSerialize);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (opts.body === undefined || opts.serializedBody === '') {
      opts.headers.delete('Content-Type');
    }

    // Transform query param keys to runtimeCase before URL build
    if (opts.query && opts.runtimeCase && opts.runtimeCase !== 'preserve') {
      opts.query = transformKeysDeep(
        opts.query,
        toCase(opts.runtimeCase),
      ) as Record<string, unknown>;
    }

    // Transform path param keys to runtimeCase before URL build
    if (opts.path && opts.runtimeCase && opts.runtimeCase !== 'preserve') {
      opts.path = transformKeysDeep(
        opts.path,
        toCase(opts.runtimeCase),
      ) as Record<string, unknown>;
    }

    const url = buildUrl(opts);

    return { opts, url };
  };

  const request: Client['request'] = async (options) => {
    // @ts-expect-error
    const { opts, url } = await beforeRequest(options);
    const requestInit: ReqInit = {
      redirect: 'follow',
      ...opts,
      body: getValidRequestBody(opts),
    };

    let request = new Request(url, requestInit);

    for (const fn of interceptors.request.fns) {
      if (fn) {
        request = await fn(request, opts);
      }
    }

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
      const parseAs =
        (opts.parseAs === 'auto'
          ? getParseAs(response.headers.get('Content-Type'))
          : opts.parseAs) ?? 'json';

      if (
        response.status === 204 ||
        response.headers.get('Content-Length') === '0'
      ) {
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
        case 'json':
        case 'text':
          data = await response[parseAs]();
          break;
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

        // Transform response keys from runtimeCase back to client case
        if (opts.runtimeCase && opts.runtimeCase !== 'preserve') {
          const targetClientCase = opts.clientCase ?? 'camelCase';
          data = transformKeysDeep(data, toCase(targetClientCase));
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

    const error = jsonError ?? textError;
    let finalError = error;

    for (const fn of interceptors.error.fns) {
      if (fn) {
        finalError = (await fn(error, response, request, opts)) as string;
      }
    }

    finalError = finalError || ({} as string);

    if (opts.throwOnError) {
      throw finalError;
    }

    // TODO: we probably want to return error and improve types
    return opts.responseStyle === 'data'
      ? undefined
      : {
          error: finalError,
          ...result,
        };
  };

  const makeMethodFn =
    (method: Uppercase<HttpMethod>) => (options: RequestOptions) =>
      request({ ...options, method });

  const makeSseFn =
    (method: Uppercase<HttpMethod>) => async (options: RequestOptions) => {
      const { opts, url } = await beforeRequest(options);
      return createSseClient({
        ...opts,
        body: opts.body as BodyInit | null | undefined,
        headers: opts.headers as unknown as Record<string, string>,
        method,
        onRequest: async (url, init) => {
          let request = new Request(url, init);
          for (const fn of interceptors.request.fns) {
            if (fn) {
              request = await fn(request, opts);
            }
          }
          return request;
        },
        url,
      });
    };

  return {
    buildUrl,
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
