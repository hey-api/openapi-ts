import type {
  FetchOptions as OfetchOptions,
  ResponseType as OfetchResponseType,
} from 'ofetch';

import { getAuthToken } from '../../client-core/bundle/auth';
import type { QuerySerializerOptions } from '../../client-core/bundle/bodySerializer';
import { jsonBodySerializer } from '../../client-core/bundle/bodySerializer';
import {
  serializeArrayParam,
  serializeObjectParam,
  serializePrimitiveParam,
} from '../../client-core/bundle/pathSerializer';
import { getUrl } from '../../client-core/bundle/utils';
import type {
  Client,
  ClientOptions,
  Config,
  RequestOptions,
  ResolvedRequestOptions,
  ResponseStyle,
} from './types';

export const createQuerySerializer = <T = unknown>({
  parameters = {},
  ...args
}: QuerySerializerOptions = {}) => {
  const querySerializer = (queryParams: T) => {
    const search: string[] = [];
    if (queryParams && typeof queryParams === 'object') {
      for (const name in queryParams) {
        const value = queryParams[name];

        if (value === undefined || value === null) {
          continue;
        }

        const options = parameters[name] || args;

        if (Array.isArray(value)) {
          const serializedArray = serializeArrayParam({
            allowReserved: options.allowReserved,
            explode: true,
            name,
            style: 'form',
            value,
            ...options.array,
          });
          if (serializedArray) search.push(serializedArray);
        } else if (typeof value === 'object') {
          const serializedObject = serializeObjectParam({
            allowReserved: options.allowReserved,
            explode: true,
            name,
            style: 'deepObject',
            value: value as Record<string, unknown>,
            ...options.object,
          });
          if (serializedObject) search.push(serializedObject);
        } else {
          const serializedPrimitive = serializePrimitiveParam({
            allowReserved: options.allowReserved,
            name,
            value: value as string,
          });
          if (serializedPrimitive) search.push(serializedPrimitive);
        }
      }
    }
    return search.join('&');
  };
  return querySerializer;
};

/**
 * Infers parseAs value from provided Content-Type header.
 */
export const getParseAs = (
  contentType: string | null,
): Exclude<Config['parseAs'], 'auto'> => {
  if (!contentType) {
    // If no Content-Type header is provided, the best we can do is return the raw response body,
    // which is effectively the same as the 'stream' option.
    return 'stream';
  }

  const cleanContent = contentType.split(';')[0]?.trim();

  if (!cleanContent) {
    return;
  }

  if (
    cleanContent.startsWith('application/json') ||
    cleanContent.endsWith('+json')
  ) {
    return 'json';
  }

  if (cleanContent === 'multipart/form-data') {
    return 'formData';
  }

  if (
    ['application/', 'audio/', 'image/', 'video/'].some((type) =>
      cleanContent.startsWith(type),
    )
  ) {
    return 'blob';
  }

  if (cleanContent.startsWith('text/')) {
    return 'text';
  }

  return;
};

/**
 * Map our parseAs value to ofetch responseType when not explicitly provided.
 */
export const mapParseAsToResponseType = (
  parseAs: Config['parseAs'] | undefined,
  explicit?: OfetchResponseType,
): OfetchResponseType | undefined => {
  if (explicit) return explicit;
  switch (parseAs) {
    case 'arrayBuffer':
    case 'blob':
    case 'json':
    case 'text':
    case 'stream':
      return parseAs;
    case 'formData':
    case 'auto':
    default:
      return undefined; // let ofetch auto-detect
  }
};

const checkForExistence = (
  options: Pick<RequestOptions, 'auth' | 'query'> & {
    headers: Headers;
  },
  name?: string,
): boolean => {
  if (!name) {
    return false;
  }
  if (
    options.headers.has(name) ||
    options.query?.[name] ||
    options.headers.get('Cookie')?.includes(`${name}=`)
  ) {
    return true;
  }
  return false;
};

export const setAuthParams = async ({
  security,
  ...options
}: Pick<Required<RequestOptions>, 'security'> &
  Pick<RequestOptions, 'auth' | 'query'> & {
    headers: Headers;
  }) => {
  for (const auth of security) {
    if (checkForExistence(options, auth.name)) {
      continue;
    }

    const token = await getAuthToken(auth, options.auth);

    if (!token) {
      continue;
    }

    const name = auth.name ?? 'Authorization';

    switch (auth.in) {
      case 'query':
        if (!options.query) {
          options.query = {};
        }
        options.query[name] = token;
        break;
      case 'cookie':
        options.headers.append('Cookie', `${name}=${token}`);
        break;
      case 'header':
      default:
        options.headers.set(name, token);
        break;
    }
  }
};

export const buildUrl: Client['buildUrl'] = (options) =>
  getUrl({
    baseUrl: options.baseUrl as string,
    path: options.path,
    query: options.query,
    querySerializer:
      typeof options.querySerializer === 'function'
        ? options.querySerializer
        : createQuerySerializer(options.querySerializer),
    url: options.url,
  });

export const mergeConfigs = (a: Config, b: Config): Config => {
  const config = { ...a, ...b };
  if (config.baseUrl?.endsWith('/')) {
    config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
  }
  config.headers = mergeHeaders(a.headers, b.headers);
  return config;
};

const headersEntries = (headers: Headers): Array<[string, string]> => {
  const entries: Array<[string, string]> = [];
  headers.forEach((value, key) => {
    entries.push([key, value]);
  });
  return entries;
};

export const mergeHeaders = (
  ...headers: Array<Required<Config>['headers'] | undefined>
): Headers => {
  const mergedHeaders = new Headers();
  for (const header of headers) {
    if (!header) {
      continue;
    }

    const iterator =
      header instanceof Headers
        ? headersEntries(header)
        : Object.entries(header);

    for (const [key, value] of iterator) {
      if (value === null) {
        mergedHeaders.delete(key);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          mergedHeaders.append(key, v as string);
        }
      } else if (value !== undefined) {
        // assume object headers are meant to be JSON stringified, i.e. their
        // content value in OpenAPI specification is 'application/json'
        mergedHeaders.set(
          key,
          typeof value === 'object' ? JSON.stringify(value) : (value as string),
        );
      }
    }
  }
  return mergedHeaders;
};

/**
 * Heuristic to detect whether a request body can be safely retried.
 */
export const isRepeatableBody = (body: unknown): boolean => {
  if (body == null) return true; // undefined/null treated as no-body
  if (typeof body === 'string') return true;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)
    return true;
  if (typeof Uint8Array !== 'undefined' && body instanceof Uint8Array)
    return true;
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer)
    return true;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return true;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
  // Streams are not repeatable
  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream)
    return false;
  // Default: assume non-repeatable for unknown structured bodies
  return false;
};

/**
 * Small helper to unify data vs fields return style.
 */
export const wrapDataReturn = <T>(
  data: T,
  result: { request: Request; response: Response },
  responseStyle: ResponseStyle | undefined,
):
  | T
  | ((T extends Record<string, unknown> ? { data: T } : { data: T }) &
      typeof result) =>
  (responseStyle ?? 'fields') === 'data'
    ? (data as any)
    : ({ data, ...result } as any);

/**
 * Small helper to unify error vs fields return style.
 */
export const wrapErrorReturn = <E>(
  error: E,
  result: { request: Request; response: Response },
  responseStyle: ResponseStyle | undefined,
):
  | undefined
  | ((E extends Record<string, unknown> ? { error: E } : { error: E }) &
      typeof result) =>
  (responseStyle ?? 'fields') === 'data'
    ? undefined
    : ({ error, ...result } as any);

/**
 * Build options for $ofetch.raw from our resolved opts and body.
 */
export const buildOfetchOptions = (
  opts: ResolvedRequestOptions,
  body: BodyInit | null | undefined,
  responseType: OfetchResponseType | undefined,
  retryOverride?: OfetchOptions['retry'],
): OfetchOptions =>
  ({
    agent: opts.agent as OfetchOptions['agent'],
    body,
    credentials: opts.credentials as OfetchOptions['credentials'],
    dispatcher: opts.dispatcher as OfetchOptions['dispatcher'],
    headers: opts.headers as Headers,
    ignoreResponseError:
      (opts.ignoreResponseError as OfetchOptions['ignoreResponseError']) ??
      true,
    method: opts.method,
    onRequest: opts.onRequest as OfetchOptions['onRequest'],
    onRequestError: opts.onRequestError as OfetchOptions['onRequestError'],
    onResponse: opts.onResponse as OfetchOptions['onResponse'],
    onResponseError: opts.onResponseError as OfetchOptions['onResponseError'],
    parseResponse: opts.parseResponse as OfetchOptions['parseResponse'],
    // URL already includes query
    query: undefined,
    responseType,
    retry: retryOverride ?? (opts.retry as OfetchOptions['retry']),
    retryDelay: opts.retryDelay as OfetchOptions['retryDelay'],
    retryStatusCodes:
      opts.retryStatusCodes as OfetchOptions['retryStatusCodes'],
    signal: opts.signal,
    timeout: opts.timeout as number | undefined,
  }) as OfetchOptions;

/**
 * Parse a successful response, handling empty bodies and stream cases.
 */
export const parseSuccess = async (
  response: Response,
  opts: ResolvedRequestOptions,
  ofetchResponseType?: OfetchResponseType,
): Promise<unknown> => {
  // Stream requested: return stream body
  if (ofetchResponseType === 'stream') {
    return response.body;
  }

  const inferredParseAs =
    (opts.parseAs === 'auto'
      ? getParseAs(response.headers.get('Content-Type'))
      : opts.parseAs) ?? 'json';

  // Handle empty responses
  if (
    response.status === 204 ||
    response.headers.get('Content-Length') === '0'
  ) {
    switch (inferredParseAs) {
      case 'arrayBuffer':
      case 'blob':
      case 'text':
        return await (response as any)[inferredParseAs]();
      case 'formData':
        return new FormData();
      case 'stream':
        return response.body;
      default:
        return {};
    }
  }

  // Prefer ofetch-populated data unless we explicitly need raw `formData`
  let data: unknown = (response as any)._data;
  if (inferredParseAs === 'formData' || typeof data === 'undefined') {
    switch (inferredParseAs) {
      case 'arrayBuffer':
      case 'blob':
      case 'formData':
      case 'text':
        data = await (response as any)[inferredParseAs]();
        break;
      case 'json': {
        // Some servers return 200 with no Content-Length and empty body.
        // response.json() would throw; detect empty via clone().text() first.
        const txt = await response.clone().text();
        if (!txt) {
          data = {};
        } else {
          data = await (response as any).json();
        }
        break;
      }
      case 'stream':
        return response.body;
    }
  }

  if (inferredParseAs === 'json') {
    if (opts.responseValidator) {
      await opts.responseValidator(data);
    }
    if (opts.responseTransformer) {
      data = await opts.responseTransformer(data);
    }
  }

  return data;
};

/**
 * Parse an error response payload.
 */
export const parseError = async (response: Response): Promise<unknown> => {
  let error: unknown = (response as any)._data;
  if (typeof error === 'undefined') {
    const textError = await response.text();
    try {
      error = JSON.parse(textError);
    } catch {
      error = textError;
    }
  }
  return error ?? ({} as string);
};

type ErrInterceptor<Err, Res, Req, Options> = (
  error: Err,
  response: Res,
  request: Req,
  options: Options,
) => Err | Promise<Err>;

type ReqInterceptor<Req, Options> = (
  request: Req,
  options: Options,
) => Req | Promise<Req>;

type ResInterceptor<Res, Req, Options> = (
  response: Res,
  request: Req,
  options: Options,
) => Res | Promise<Res>;

class Interceptors<Interceptor> {
  fns: Array<Interceptor | null> = [];

  clear(): void {
    this.fns = [];
  }

  eject(id: number | Interceptor): void {
    const index = this.getInterceptorIndex(id);
    if (this.fns[index]) {
      this.fns[index] = null;
    }
  }

  exists(id: number | Interceptor): boolean {
    const index = this.getInterceptorIndex(id);
    return Boolean(this.fns[index]);
  }

  getInterceptorIndex(id: number | Interceptor): number {
    if (typeof id === 'number') {
      return this.fns[id] ? id : -1;
    }
    return this.fns.indexOf(id);
  }

  update(
    id: number | Interceptor,
    fn: Interceptor,
  ): number | Interceptor | false {
    const index = this.getInterceptorIndex(id);
    if (this.fns[index]) {
      this.fns[index] = fn;
      return id;
    }
    return false;
  }

  use(fn: Interceptor): number {
    this.fns.push(fn);
    return this.fns.length - 1;
  }
}

export interface Middleware<Req, Res, Err, Options> {
  error: Interceptors<ErrInterceptor<Err, Res, Req, Options>>;
  request: Interceptors<ReqInterceptor<Req, Options>>;
  response: Interceptors<ResInterceptor<Res, Req, Options>>;
}

export const createInterceptors = <Req, Res, Err, Options>(): Middleware<
  Req,
  Res,
  Err,
  Options
> => ({
  error: new Interceptors<ErrInterceptor<Err, Res, Req, Options>>(),
  request: new Interceptors<ReqInterceptor<Req, Options>>(),
  response: new Interceptors<ResInterceptor<Res, Req, Options>>(),
});

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

export const createConfig = <T extends ClientOptions = ClientOptions>(
  override: Config<Omit<ClientOptions, keyof T> & T> = {},
): Config<Omit<ClientOptions, keyof T> & T> => ({
  ...jsonBodySerializer,
  headers: defaultHeaders,
  ignoreResponseError: true,
  parseAs: 'auto',
  querySerializer: defaultQuerySerializer,
  ...override,
});
