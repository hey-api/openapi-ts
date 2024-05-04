import type {
  ApiRequestOptions,
  ApiResult,
  OnCancel,
  OpenAPIConfig,
} from '@hey-api/client-core';
import {
  base64,
  CancelablePromise,
  catchErrorCodes,
  getFormData,
  getUrl as _getUrl,
  isBlob,
  isFormData,
  isString,
  isStringWithValue,
  resolve,
} from '@hey-api/client-core';

import type { Config, Req, RequestResponse } from './types';
import {
  createDefaultConfig,
  createInterceptors,
  createQuerySerializer,
  getUrl,
  mergeHeaders,
} from './utils';

const getHeaders = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions,
): Promise<Headers> => {
  const [token, username, password, additionalHeaders] = await Promise.all([
    resolve(options, config.TOKEN),
    resolve(options, config.USERNAME),
    resolve(options, config.PASSWORD),
    resolve(options, config.HEADERS),
  ]);

  const headers = Object.entries({
    Accept: 'application/json',
    ...additionalHeaders,
    ...options.headers,
  })
    .filter(([, value]) => value !== undefined && value !== null)
    .reduce(
      (headers, [key, value]) => ({
        ...headers,
        [key]: String(value),
      }),
      {} as Record<string, string>,
    );

  if (isStringWithValue(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isStringWithValue(username) && isStringWithValue(password)) {
    const credentials = base64(`${username}:${password}`);
    headers['Authorization'] = `Basic ${credentials}`;
  }

  if (options.body !== undefined) {
    if (options.mediaType) {
      headers['Content-Type'] = options.mediaType;
    } else if (isBlob(options.body)) {
      headers['Content-Type'] = options.body.type || 'application/octet-stream';
    } else if (isString(options.body)) {
      headers['Content-Type'] = 'text/plain';
    } else if (!isFormData(options.body)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  return new Headers(headers);
};

const getRequestBody = (options: ApiRequestOptions): unknown => {
  if (options.body !== undefined) {
    if (
      options.mediaType?.includes('application/json') ||
      options.mediaType?.includes('+json')
    ) {
      return JSON.stringify(options.body);
    } else if (
      isString(options.body) ||
      isBlob(options.body) ||
      isFormData(options.body)
    ) {
      return options.body;
    } else {
      return JSON.stringify(options.body);
    }
  }
  return undefined;
};

const sendRequest = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions,
  url: string,
  body: any,
  formData: FormData | undefined,
  headers: Headers,
  onCancel: OnCancel,
): Promise<Response> => {
  const controller = new AbortController();

  let request: RequestInit = {
    body: body ?? formData,
    headers,
    method: options.method,
    signal: controller.signal,
  };

  if (config.WITH_CREDENTIALS) {
    request.credentials = config.CREDENTIALS;
  }

  for (const fn of config.interceptors.request._fns) {
    request = await fn(request);
  }

  onCancel(() => controller.abort());

  return await fetch(url, request);
};

const getResponseHeader = (
  response: Response,
  responseHeader?: string,
): string | undefined => {
  if (responseHeader) {
    const content = response.headers.get(responseHeader);
    if (isString(content)) {
      return content;
    }
  }
  return undefined;
};

const getResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status !== 204) {
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType) {
        const binaryTypes = [
          'application/octet-stream',
          'application/pdf',
          'application/zip',
          'audio/',
          'image/',
          'video/',
        ];
        if (
          contentType.includes('application/json') ||
          contentType.includes('+json')
        ) {
          return await response.json();
        } else if (binaryTypes.some((type) => contentType.includes(type))) {
          return await response.blob();
        } else if (contentType.includes('multipart/form-data')) {
          return await response.formData();
        } else if (contentType.includes('text/')) {
          return await response.text();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return undefined;
};

/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param options The request options from the service
 * @returns CancelablePromise<T>
 * @throws ApiError
 */
export const request = <T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions,
): CancelablePromise<T> =>
  new CancelablePromise(async (resolve, reject, onCancel) => {
    try {
      const url = _getUrl(config, options);
      const formData = getFormData(options);
      const body = getRequestBody(options);
      const headers = await getHeaders(config, options);

      if (!onCancel.isCancelled) {
        let response = await sendRequest(
          config,
          options,
          url,
          body,
          formData,
          headers,
          onCancel,
        );

        for (const fn of config.interceptors.response._fns) {
          response = await fn(response);
        }

        const responseBody = await getResponseBody(response);
        const responseHeader = getResponseHeader(
          response,
          options.responseHeader,
        );

        const result: ApiResult = {
          body: responseHeader ?? responseBody,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          url,
        };

        catchErrorCodes(options, result);

        resolve(result.body);
      }
    } catch (error) {
      reject(error);
    }
  });

type Options = Omit<Req, 'method'>;

type ReqInit = Omit<RequestInit, 'headers'> & {
  headers: ReturnType<typeof mergeHeaders>;
};

type Opts = Req &
  Config & {
    headers: ReturnType<typeof mergeHeaders>;
  };

let globalConfig = createDefaultConfig();

const globalInterceptors = createInterceptors<Request, Response, Opts>();

export const createClient = (config: Partial<Config>) => {
  const defaultConfig = createDefaultConfig();
  const _config = { ...defaultConfig, ...config };

  if (_config.baseUrl.endsWith('/')) {
    _config.baseUrl = _config.baseUrl.substring(0, _config.baseUrl.length - 1);
  }
  _config.headers = mergeHeaders(defaultConfig.headers, _config.headers);

  if (_config.global) {
    globalConfig = { ..._config };
  }

  const getConfig = () => (_config.global ? globalConfig : _config);

  const interceptors = _config.global
    ? globalInterceptors
    : createInterceptors<Request, Response, Opts>();

  const request = async <Data = unknown, Error = unknown>(
    options: Req,
  ): Promise<RequestResponse<Data, Error>> => {
    const config = getConfig();

    const opts: Opts = {
      ...config,
      ...options,
      headers: mergeHeaders(config.headers, options.headers),
    };

    const url = getUrl({
      baseUrl: opts.baseUrl,
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
    if (opts.body) {
      requestInit.body = opts.bodySerializer(opts.body);
    }
    // remove Content-Type if serialized body is FormData; browser will correctly set Content-Type and boundary expression
    if (requestInit.body instanceof FormData) {
      requestInit.headers.delete('Content-Type');
    }

    let request = new Request(url, requestInit);

    for (const fn of interceptors.request._fns) {
      request = await fn(request, opts);
    }

    const _fetch = opts.fetch;
    let response = await _fetch(request);

    for (const fn of interceptors.response._fns) {
      response = await fn(response, request, opts);
    }

    // return empty objects so truthy checks for data/error succeed
    if (
      response.status === 204 ||
      response.headers.get('Content-Length') === '0'
    ) {
      if (response.ok) {
        return {
          // @ts-ignore
          data: {},
          response,
        };
      }
      return {
        // @ts-ignore
        error: {},
        response,
      };
    }

    if (response.ok) {
      if (opts.parseAs === 'stream') {
        return {
          // @ts-ignore
          data: response.body,
          response,
        };
      }
      return {
        data: await response[opts.parseAs](),
        response,
      };
    }

    let error = await response.text();
    try {
      error = JSON.parse(error);
    } catch {
      // noop
    }
    return {
      // @ts-ignore
      error,
      response,
    };

    // TODO: add abort function
    // TODO: return original request as result.request
  };

  type Interceptors = {
    [P in keyof typeof interceptors]: Pick<
      (typeof interceptors)[P],
      'eject' | 'use'
    >;
  };

  const client = {
    connect: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'CONNECT' }),
    delete: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'DELETE' }),
    get: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'GET' }),
    getConfig,
    head: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'HEAD' }),
    interceptors: interceptors as Interceptors,
    options: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'OPTIONS' }),
    patch: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'PATCH' }),
    post: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'POST' }),
    put: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'PUT' }),
    request,
    trace: <Data = unknown, Error = unknown>(options: Options) =>
      request<Data, Error>({ ...options, method: 'TRACE' }),
  };
  return client;
};

export const client = createClient(globalConfig);
