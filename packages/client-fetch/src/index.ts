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
  resolve,
} from '@hey-api/client-core';

export const getHeaders = async (
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

export const getRequestBody = (options: ApiRequestOptions): unknown => {
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

export const sendRequest = async (
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

export const getResponseHeader = (
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

export const getResponseBody = async (response: Response): Promise<unknown> => {
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
      const url = getUrl(config, options);
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
