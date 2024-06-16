import type {
  ApiRequestOptions,
  ApiResult,
  Headers,
  Middleware,
  Resolver,
} from './types';

export { CancelablePromise, CancelError, OnCancel } from './cancelablePromise';

export class ApiError extends Error {
  public readonly url: string;
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: unknown;
  public readonly request: ApiRequestOptions;

  constructor(
    request: ApiRequestOptions,
    response: ApiResult,
    message: string,
  ) {
    super(message);

    this.name = 'ApiError';
    this.url = response.url;
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = response.body;
    this.request = request;
  }
}

export class Interceptors<T> {
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

export type OpenAPIConfig<TRequest = any, TResponse = any> = {
  BASE: string;
  CREDENTIALS: 'include' | 'omit' | 'same-origin';
  ENCODE_PATH?: ((path: string) => string) | undefined;
  HEADERS?: Headers | Resolver<Headers> | undefined;
  PASSWORD?: string | Resolver<string> | undefined;
  TOKEN?: string | Resolver<string> | undefined;
  USERNAME?: string | Resolver<string> | undefined;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  interceptors: {
    request: Interceptors<TRequest>;
    response: Interceptors<TResponse>;
  };
};

export const OpenAPI: OpenAPIConfig = {
  BASE: '{{{server}}}',
  CREDENTIALS: 'include',
  ENCODE_PATH: undefined,
  HEADERS: undefined,
  PASSWORD: undefined,
  TOKEN: undefined,
  USERNAME: undefined,
  VERSION: '{{{version}}}',
  WITH_CREDENTIALS: false,
  interceptors: {
    request: new Interceptors(),
    response: new Interceptors(),
  },
};

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isStringWithValue = (value: unknown): value is string =>
  isString(value) && value !== '';

export const isBlob = (value: any): value is Blob => value instanceof Blob;

export const isFormData = (value: unknown): value is FormData =>
  value instanceof FormData;

export const isSuccess = (status: number): boolean =>
  status >= 200 && status < 300;

export const base64 = (str: string): string => {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString('base64');
  }
};

export const getQueryString = (params: Record<string, unknown>): string => {
  const qs: string[] = [];

  const append = (key: string, value: unknown) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  const encodePair = (key: string, value: unknown) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof Date) {
      append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach((v) => encodePair(key, v));
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => encodePair(`${key}[${k}]`, v));
    } else {
      append(key, value);
    }
  };

  Object.entries(params).forEach(([key, value]) => encodePair(key, value));

  return qs.length ? `?${qs.join('&')}` : '';
};

export const getUrl = (
  config: OpenAPIConfig,
  options: ApiRequestOptions,
): string => {
  const encoder = config.ENCODE_PATH || encodeURI;

  const path = options.url
    .replace('{api-version}', config.VERSION)
    .replace(/{(.*?)}/g, (substring: string, group: string) => {
      if (options.path?.hasOwnProperty(group)) {
        return encoder(String(options.path[group]));
      }
      return substring;
    });

  const url = config.BASE + path;
  return options.query ? url + getQueryString(options.query) : url;
};

export const getFormData = (
  options: ApiRequestOptions,
): FormData | undefined => {
  if (options.formData) {
    const formData = new FormData();

    const process = (key: string, value: unknown) => {
      if (isString(value) || isBlob(value)) {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    };

    Object.entries(options.formData)
      .filter(([, value]) => value !== undefined && value !== null)
      .forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => process(key, v));
        } else {
          process(key, value);
        }
      });

    return formData;
  }
  return undefined;
};

export const resolve = async <T>(
  options: ApiRequestOptions<T>,
  resolver?: T | Resolver<T>,
): Promise<T | undefined> => {
  if (typeof resolver === 'function') {
    return (resolver as Resolver<T>)(options);
  }
  return resolver;
};

export const catchErrorCodes = (
  options: ApiRequestOptions,
  result: ApiResult,
): void => {
  const errors: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: 'Im a teapot',
    421: 'Misdirected Request',
    422: 'Unprocessable Content',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
    ...options.errors,
  };

  const error = errors[result.status];
  if (error) {
    throw new ApiError(options, result, error);
  }

  if (!result.ok) {
    const errorStatus = result.status ?? 'unknown';
    const errorStatusText = result.statusText ?? 'unknown';
    const errorBody = (() => {
      try {
        return JSON.stringify(result.body, null, 2);
      } catch (e) {
        return undefined;
      }
    })();

    throw new ApiError(
      options,
      result,
      `Generic Error: status: ${errorStatus}; status text: ${errorStatusText}; body: ${errorBody}`,
    );
  }
};
