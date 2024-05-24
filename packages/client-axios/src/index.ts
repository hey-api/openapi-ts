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
  getUrl,
  isBlob,
  isFormData,
  isString,
  isStringWithValue,
  isSuccess,
  resolve,
} from '@hey-api/client-core';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import axios from 'axios';

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

// TODO: remove this export
export const OpenAPI: OpenAPIConfig<AxiosRequestConfig, AxiosResponse> = {
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

export const getHeaders = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions,
): Promise<Record<string, string>> => {
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
  } else if (options.formData !== undefined) {
    if (options.mediaType) {
      headers['Content-Type'] = options.mediaType;
    }
  }

  return headers;
};

export const getRequestBody = (options: ApiRequestOptions): unknown => {
  if (options.body) {
    return options.body;
  }
  return undefined;
};

export const sendRequest = async <T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions,
  url: string,
  body: unknown,
  formData: FormData | undefined,
  headers: Record<string, string>,
  onCancel: OnCancel,
  axiosClient: AxiosInstance,
): Promise<AxiosResponse<T>> => {
  const controller = new AbortController();

  let requestConfig: AxiosRequestConfig = {
    data: body ?? formData,
    headers,
    method: options.method,
    signal: controller.signal,
    url,
    withCredentials: config.WITH_CREDENTIALS,
  };

  onCancel(() => controller.abort());

  for (const fn of config.interceptors.request._fns) {
    requestConfig = await fn(requestConfig);
  }

  try {
    return await axiosClient.request(requestConfig);
  } catch (error) {
    const axiosError = error as AxiosError<T>;
    if (axiosError.response) {
      return axiosError.response;
    }
    throw error;
  }
};

export const getResponseHeader = (
  response: AxiosResponse<unknown>,
  responseHeader?: string,
): string | undefined => {
  if (responseHeader) {
    const content = response.headers[responseHeader];
    if (isString(content)) {
      return content;
    }
  }
  return undefined;
};

export const getResponseBody = (response: AxiosResponse<unknown>): unknown => {
  if (response.status !== 204) {
    return response.data;
  }
  return undefined;
};

/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param options The request options from the service
 * @param axiosClient The axios client instance to use
 * @returns CancelablePromise<T>
 * @throws ApiError
 */
export const request = <T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions,
  axiosClient: AxiosInstance = axios,
): CancelablePromise<T> =>
  new CancelablePromise(async (resolve, reject, onCancel) => {
    try {
      const url = getUrl(config, options);
      const formData = getFormData(options);
      const body = getRequestBody(options);
      const headers = await getHeaders(config, options);

      if (!onCancel.isCancelled) {
        let response = await sendRequest<T>(
          config,
          options,
          url,
          body,
          formData,
          headers,
          onCancel,
          axiosClient,
        );

        for (const fn of config.interceptors.response._fns) {
          response = await fn(response);
        }

        const responseBody = getResponseBody(response);
        const responseHeader = getResponseHeader(
          response,
          options.responseHeader,
        );

        const result: ApiResult = {
          body: responseHeader ?? responseBody,
          ok: isSuccess(response.status),
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

interface Config {
  /**
   * Base URL...
   * @default ''
   */
  baseUrl?: string;
  /**
   * Global??
   * @default true
   */
  global?: boolean;
}

let globalConfig: Config = {
  baseUrl: '',
  global: true,
};

export const createClient = (config: Config) => {
  const isGlobal = config.global === undefined || config.global;

  if (isGlobal) {
    globalConfig = {
      ...globalConfig,
      ...config,
    };
  }

  const getConfig = () => (isGlobal ? globalConfig : config);

  const request = (options: ApiRequestOptions) => {
    const config = getConfig();
    console.log(
      `send request with ${options.method} method to URL ${options.url} with base ${config.baseUrl}`,
    );
  };

  const client = {
    connect: async (url: string) =>
      request({
        method: 'CONNECT',
        url,
      }),
    // async DELETE(url, init) {
    //   return coreFetch(url, { ...init, method: "DELETE" });
    // },
    delete: async (url: string) =>
      request({
        method: 'DELETE',
        url,
      }),
    // async GET(url, init) {
    //   return coreFetch(url, { ...init, method: "GET" });
    // },
    get: async (url: string) =>
      request({
        method: 'GET',
        url,
      }),
    getConfig,
    // async HEAD(url, init) {
    //   return coreFetch(url, { ...init, method: "HEAD" });
    // },
    head: async (url: string) =>
      request({
        method: 'HEAD',
        url,
      }),
    // async OPTIONS(url, init) {
    //   return coreFetch(url, { ...init, method: "OPTIONS" });
    // },
    options: async (url: string) =>
      request({
        method: 'OPTIONS',
        url,
      }),
    // async PATCH(url, init) {
    //   return coreFetch(url, { ...init, method: "PATCH" });
    // },
    patch: async (url: string) =>
      request({
        method: 'PATCH',
        url,
      }),
    // async POST(url, init) {
    //   return coreFetch(url, { ...init, method: "POST" });
    // },
    post: async (url: string) =>
      request({
        method: 'POST',
        url,
      }),
    // async PUT(url, init) {
    //   return coreFetch(url, { ...init, method: "PUT" });
    // },
    put: async (url: string) =>
      request({
        method: 'PUT',
        url,
      }),
    request,
    // async TRACE(url, init) {
    //   return coreFetch(url, { ...init, method: "TRACE" });
    // },
    trace: async (url: string) =>
      request({
        method: 'TRACE',
        url,
      }),
  };

  return client;
};

export const client = createClient(globalConfig);
