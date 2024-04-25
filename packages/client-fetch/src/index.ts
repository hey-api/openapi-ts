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

import type { Config, Req } from './types';
import { createQuerySerializer, getUrl, mergeHeaders } from './utils';

type Middleware<T> = (value: T) => T | Promise<T>;

class Interceptors<T> {
  _fns: Middleware<T>[];

  constructor() {
    this._fns = [];
  }

  eject(fn: Middleware<T>) {
    const index = this._fns.indexOf(fn);
    if (index !== -1) {
      this._fns = [...this._fns.slice(0, index), ...this._fns.slice(index + 1)];
    }
  }

  use(fn: Middleware<T>) {
    this._fns = [...this._fns, fn];
  }
}

export const OpenAPI: OpenAPIConfig<RequestInit, Response> = {
  BASE: '',
  CREDENTIALS: 'include',
  ENCODE_PATH: undefined,
  HEADERS: undefined,
  PASSWORD: undefined,
  TOKEN: undefined,
  USERNAME: undefined,
  VERSION: '1.26.0',
  WITH_CREDENTIALS: false,
  interceptors: { request: new Interceptors(), response: new Interceptors() },
};

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

const defaultBodySerializer = <T>(body: T) => JSON.stringify(body);

const defaultQuerySerializer = createQuerySerializer({
  allowReserved: false,
  array: {
    explode: true,
    style: 'form',
  },
  object: {
    explode: true,
    style: 'deepObject',
  },
});

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const defaultConfig: Config = {
  baseUrl: '',
  bodySerializer: defaultBodySerializer,
  fetch: globalThis.fetch,
  global: true,
  headers: defaultHeaders,
  querySerializer: defaultQuerySerializer,
};

let globalConfig: Config = { ...defaultConfig };

type Method = Omit<Req, 'method'>;

export const createClient = (config: Partial<Config>) => {
  const _config = { ...defaultConfig, ...config };

  if (_config.baseUrl.endsWith('/')) {
    _config.baseUrl = _config.baseUrl.substring(0, _config.baseUrl.length - 1);
  }
  _config.headers = mergeHeaders(defaultHeaders, _config.headers);

  if (_config.global) {
    globalConfig = { ..._config };
  }

  const getConfig = () => (_config.global ? globalConfig : _config);

  const interceptors = {
    request: new Interceptors(),
    response: new Interceptors(),
  };

  const request = async (options: Req) => {
    const config = getConfig();

    const qs = options.querySerializer ?? config.querySerializer;

    const url = getUrl({
      baseUrl: config.baseUrl,
      path: options.path,
      query: options.query,
      querySerializer:
        typeof qs === 'function' ? qs : createQuerySerializer(qs),
      url: options.url,
    });

    const requestInit: Omit<RequestInit, 'headers'> & {
      headers: ReturnType<typeof mergeHeaders>;
    } = {
      redirect: 'follow',
      ...config,
      ...options,
      headers: mergeHeaders(config.headers, options.headers),
    };
    if (requestInit.body) {
      requestInit.body = config.bodySerializer(requestInit.body);
    }
    // remove `Content-Type` if serialized body is FormData; browser will correctly set Content-Type & boundary expression
    if (requestInit.body instanceof FormData) {
      requestInit.headers.delete('Content-Type');
    }

    const request = new Request(url, requestInit);

    // interceptors.request._fns

    const response = await config.fetch(request);

    console.log(response);
  };

  const client = {
    connect: (options: Method) => request({ ...options, method: 'CONNECT' }),
    delete: (options: Method) => request({ ...options, method: 'DELETE' }),
    get: (options: Method) => request({ ...options, method: 'GET' }),
    getConfig,
    head: (options: Method) => request({ ...options, method: 'HEAD' }),
    interceptors,
    options: (options: Method) => request({ ...options, method: 'OPTIONS' }),
    patch: (options: Method) => request({ ...options, method: 'PATCH' }),
    post: (options: Method) => request({ ...options, method: 'POST' }),
    put: (options: Method) => request({ ...options, method: 'PUT' }),
    request,
    trace: (options: Method) => request({ ...options, method: 'TRACE' }),
  };
  return client;
};

export const client = createClient(globalConfig);
