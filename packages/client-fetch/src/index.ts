import type { Config, FetchClient, FinalRequestOptions } from './types';
import {
  createDefaultConfig,
  createInterceptors,
  createQuerySerializer,
  getUrl,
  mergeHeaders,
} from './utils';

// const getHeaders = async (
//   config: OpenAPIConfig,
//   options: ApiRequestOptions,
// ): Promise<Headers> => {
//   const [token, username, password, additionalHeaders] = await Promise.all([
//     resolve(options, config.TOKEN),
//     resolve(options, config.USERNAME),
//     resolve(options, config.PASSWORD),
//     resolve(options, config.HEADERS),
//   ]);

//   const headers = Object.entries({
//     Accept: 'application/json',
//     ...additionalHeaders,
//     ...options.headers,
//   })
//     .filter(([, value]) => value !== undefined && value !== null)
//     .reduce(
//       (headers, [key, value]) => ({
//         ...headers,
//         [key]: String(value),
//       }),
//       {} as Record<string, string>,
//     );

//   if (isStringWithValue(token)) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }

//   if (isStringWithValue(username) && isStringWithValue(password)) {
//     const credentials = base64(`${username}:${password}`);
//     headers['Authorization'] = `Basic ${credentials}`;
//   }

//   if (options.body !== undefined) {
//     if (options.mediaType) {
//       headers['Content-Type'] = options.mediaType;
//     } else if (isBlob(options.body)) {
//       headers['Content-Type'] = options.body.type || 'application/octet-stream';
//     } else if (isString(options.body)) {
//       headers['Content-Type'] = 'text/plain';
//     } else if (!isFormData(options.body)) {
//       headers['Content-Type'] = 'application/json';
//     }
//   }

//   return new Headers(headers);
// };

// const getResponseBody = async (response: Response): Promise<unknown> => {
//   const contentType = response.headers.get('Content-Type');
//   if (contentType) {
//     const binaryTypes = [
//       'application/octet-stream',
//       'application/pdf',
//       'application/zip',
//       'audio/',
//       'image/',
//       'video/',
//     ];
//     if (
//       contentType.includes('application/json') ||
//       contentType.includes('+json')
//     ) {
//       return await response.json();
//     } else if (binaryTypes.some((type) => contentType.includes(type))) {
//       return await response.blob();
//     } else if (contentType.includes('multipart/form-data')) {
//       return await response.formData();
//     } else if (contentType.includes('text/')) {
//       return await response.text();
//     }
//   }
// };

type ReqInit = Omit<RequestInit, 'body' | 'headers'> & {
  body?: any;
  headers: ReturnType<typeof mergeHeaders>;
};

let globalConfig = createDefaultConfig();

const globalInterceptors = createInterceptors<
  Request,
  Response,
  FinalRequestOptions
>();

export const createClient = (config: Config): FetchClient => {
  const defaultConfig = createDefaultConfig();
  const _config = { ...defaultConfig, ...config };

  if (_config.baseUrl?.endsWith('/')) {
    _config.baseUrl = _config.baseUrl.substring(0, _config.baseUrl.length - 1);
  }
  _config.headers = mergeHeaders(defaultConfig.headers, _config.headers);

  if (_config.global) {
    globalConfig = { ..._config };
  }

  const getConfig = () => (_config.global ? globalConfig : _config);

  const interceptors = _config.global
    ? globalInterceptors
    : createInterceptors<Request, Response, FinalRequestOptions>();

  // @ts-ignore
  const request: FetchClient['request'] = async (options) => {
    const config = getConfig();

    const opts: FinalRequestOptions = {
      ...config,
      ...options,
      headers: mergeHeaders(config.headers, options.headers),
    };
    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    const url = getUrl({
      baseUrl: opts.baseUrl ?? '',
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
    // remove Content-Type if serialized body is FormData; browser will correctly set Content-Type and boundary expression
    if (requestInit.body instanceof FormData) {
      requestInit.headers.delete('Content-Type');
    }

    let request = new Request(url, requestInit);

    for (const fn of interceptors.request._fns) {
      request = await fn(request, opts);
    }

    const _fetch = opts.fetch!;
    let response = await _fetch(request);

    for (const fn of interceptors.response._fns) {
      response = await fn(response, request, opts);
    }

    const result = {
      request,
      response,
    };

    // return empty objects so truthy checks for data/error succeed
    if (
      response.status === 204 ||
      response.headers.get('Content-Length') === '0'
    ) {
      if (response.ok) {
        return {
          data: {},
          ...result,
        };
      }
      return {
        error: {},
        ...result,
      };
    }

    if (response.ok) {
      if (opts.parseAs === 'stream') {
        return {
          data: response.body,
          ...result,
        };
      }
      return {
        data: await response[opts.parseAs ?? 'json'](),
        ...result,
      };
    }

    let error = await response.text();
    try {
      error = JSON.parse(error);
    } catch {
      // noop
    }
    return {
      error,
      ...result,
    };
  };

  return {
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
    trace: (options) => request({ ...options, method: 'TRACE' }),
  };
};

export const client = createClient(globalConfig);
