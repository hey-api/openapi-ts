import type {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {
  HttpContextToken,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { getAuthToken } from '../../client-core/bundle/auth';
import type {
  QuerySerializer,
  QuerySerializerOptions,
} from '../../client-core/bundle/bodySerializer';
import {
  serializeArrayParam,
  serializeObjectParam,
  serializePrimitiveParam,
} from '../../client-core/bundle/pathSerializer';
import type {
  Client,
  ClientOptions,
  Config,
  RequestOptions,
  ResolvedRequestOptions,
  ResponseStyle,
} from './types';

interface PathSerializer {
  path: Record<string, unknown>;
  url: string;
}

const PATH_PARAM_RE = /\{[^{}]+\}/g;

type ArrayStyle = 'form' | 'spaceDelimited' | 'pipeDelimited';
type MatrixStyle = 'label' | 'matrix' | 'simple';
type ArraySeparatorStyle = ArrayStyle | MatrixStyle;

const defaultPathSerializer = ({ path, url: _url }: PathSerializer) => {
  let url = _url;
  const matches = _url.match(PATH_PARAM_RE);
  if (matches) {
    for (const match of matches) {
      let explode = false;
      let name = match.substring(1, match.length - 1);
      let style: ArraySeparatorStyle = 'simple';

      if (name.endsWith('*')) {
        explode = true;
        name = name.substring(0, name.length - 1);
      }

      if (name.startsWith('.')) {
        name = name.substring(1);
        style = 'label';
      } else if (name.startsWith(';')) {
        name = name.substring(1);
        style = 'matrix';
      }

      const value = path[name];

      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        url = url.replace(
          match,
          serializeArrayParam({ explode, name, style, value }),
        );
        continue;
      }

      if (typeof value === 'object') {
        url = url.replace(
          match,
          serializeObjectParam({
            explode,
            name,
            style,
            value: value as Record<string, unknown>,
            valueOnly: true,
          }),
        );
        continue;
      }

      if (style === 'matrix') {
        url = url.replace(
          match,
          `;${serializePrimitiveParam({
            name,
            value: value as string,
          })}`,
        );
        continue;
      }

      const replaceValue = encodeURIComponent(
        style === 'label' ? `.${value as string}` : (value as string),
      );
      url = url.replace(match, replaceValue);
    }
  }
  return url;
};

export const createQuerySerializer = <T = unknown>({
  allowReserved,
  array,
  object,
}: QuerySerializerOptions = {}) => {
  const querySerializer = (queryParams: T) => {
    const search: string[] = [];
    if (queryParams && typeof queryParams === 'object') {
      for (const name in queryParams) {
        const value = queryParams[name];

        if (value === undefined || value === null) {
          continue;
        }

        if (Array.isArray(value)) {
          const serializedArray = serializeArrayParam({
            allowReserved,
            explode: true,
            name,
            style: 'form',
            value,
            ...array,
          });
          if (serializedArray) search.push(serializedArray);
        } else if (typeof value === 'object') {
          const serializedObject = serializeObjectParam({
            allowReserved,
            explode: true,
            name,
            style: 'deepObject',
            value: value as Record<string, unknown>,
            ...object,
          });
          if (serializedObject) search.push(serializedObject);
        } else {
          const serializedPrimitive = serializePrimitiveParam({
            allowReserved,
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
): 'blob' | 'formData' | 'json' | 'stream' | 'text' | undefined => {
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

export const setAuthParams = async (
  options: Pick<Required<RequestOptions>, 'security'> &
    Pick<RequestOptions, 'auth' | 'query'> & {
      headers: HttpHeaders;
    },
) => {
  for (const auth of options.security) {
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
        options.headers = options.headers.append('Cookie', `${name}=${token}`);
        break;
      case 'header':
      default:
        options.headers = options.headers.set(name, token);
        break;
    }

    return;
  }
};

export const buildUrl: Client['buildUrl'] = (options) => {
  const url = getUrl({
    baseUrl: options.baseUrl as string,
    path: options.path,
    query: options.query,
    querySerializer:
      typeof options.querySerializer === 'function'
        ? options.querySerializer
        : createQuerySerializer(options.querySerializer),
    url: options.url,
  });
  return url;
};

export const getUrl = ({
  baseUrl,
  path,
  query,
  querySerializer,
  url: _url,
}: {
  baseUrl?: string;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  querySerializer: QuerySerializer;
  url: string;
}) => {
  const pathUrl = _url.startsWith('/') ? _url : `/${_url}`;
  let url = (baseUrl ?? '') + pathUrl;
  if (path) {
    url = defaultPathSerializer({ path, url });
  }
  let search = query ? querySerializer(query) : '';
  if (search.startsWith('?')) {
    search = search.substring(1);
  }
  if (search) {
    url += `?${search}`;
  }
  return url;
};

export const mergeConfigs = (a: Config, b: Config): Config => {
  const config = { ...a, ...b };
  if (config.baseUrl?.endsWith('/')) {
    config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
  }
  config.headers = mergeHeaders(a.headers, b.headers);
  return config;
};

export const mergeHeaders = (
  ...headers: Array<Required<Config>['headers'] | undefined>
): HttpHeaders => {
  let mergedHeaders = new HttpHeaders();

  for (const header of headers) {
    if (!header || typeof header !== 'object') {
      continue;
    }

    if (header instanceof HttpHeaders) {
      // Merge HttpHeaders instance
      header.keys().forEach((key) => {
        const values = header.getAll(key);
        if (values) {
          values.forEach((value) => {
            mergedHeaders = mergedHeaders.append(key, value);
          });
        }
      });
    } else {
      // Merge plain object headers
      for (const [key, value] of Object.entries(header)) {
        if (value === null) {
          mergedHeaders = mergedHeaders.delete(key);
        } else if (Array.isArray(value)) {
          for (const v of value) {
            mergedHeaders = mergedHeaders.append(key, v as string);
          }
        } else if (value !== undefined) {
          // assume object headers are meant to be JSON stringified, i.e. their
          // content value in OpenAPI specification is 'application/json'
          mergedHeaders = mergedHeaders.set(
            key,
            typeof value === 'object'
              ? JSON.stringify(value)
              : (value as string),
          );
        }
      }
    }
  }

  return mergedHeaders;
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
  fns: (Interceptor | null)[];

  constructor() {
    this.fns = [];
  }

  clear() {
    this.fns = [];
  }

  getInterceptorIndex(id: number | Interceptor): number {
    if (typeof id === 'number') {
      return this.fns[id] ? id : -1;
    } else {
      return this.fns.indexOf(id);
    }
  }
  exists(id: number | Interceptor) {
    const index = this.getInterceptorIndex(id);
    return !!this.fns[index];
  }

  eject(id: number | Interceptor) {
    const index = this.getInterceptorIndex(id);
    if (this.fns[index]) {
      this.fns[index] = null;
    }
  }

  update(id: number | Interceptor, fn: Interceptor) {
    const index = this.getInterceptorIndex(id);
    if (this.fns[index]) {
      this.fns[index] = fn;
      return id;
    } else {
      return false;
    }
  }

  use(fn: Interceptor) {
    this.fns = [...this.fns, fn];
    return this.fns.length - 1;
  }
}

// `createInterceptors()` response, meant for external use as it does not
// expose internals
export interface Middleware<Req, Res, Err, Options> {
  error: Pick<
    Interceptors<ErrInterceptor<Err, Res, Req, Options>>,
    'eject' | 'use' | 'fns'
  >;
  request: Pick<
    Interceptors<ReqInterceptor<Req, Options>>,
    'eject' | 'use' | 'fns'
  >;
  response: Pick<
    Interceptors<ResInterceptor<Res, Req, Options>>,
    'eject' | 'use' | 'fns'
  >;
}

// do not add `Middleware` as return type so we can use _fns internally
export const createInterceptors = <Req, Res, Err, Options>() => ({
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
  headers: defaultHeaders,
  querySerializer: defaultQuerySerializer,
  ...override,
});

export const INTERCEPTORS_CONTEXT = new HttpContextToken<
  Middleware<any, any, any, any> | undefined
>(() => undefined);
export const OPTIONS_CONTEXT = new HttpContextToken<any>(() => undefined);

@Injectable()
export class HeyApiInterceptor implements HttpInterceptor {
  interceptors = createInterceptors<
    HttpRequest<unknown>,
    HttpResponse<unknown>,
    unknown,
    ResolvedRequestOptions
  >();

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const interceptors = req.context.get(INTERCEPTORS_CONTEXT);
    if (!interceptors) {
      return next.handle(req);
    }

    const options = req.context.get(OPTIONS_CONTEXT) || {};
    return from(
      Promise.resolve().then(async () => {
        let modifiedReq = req;
        for (const fn of interceptors.request.fns) {
          if (fn) {
            modifiedReq = await fn(modifiedReq, options);
          }
        }
        return modifiedReq;
      }),
    ).pipe(
      switchMap((modifiedReq) => next.handle(modifiedReq)),
      switchMap((event) => {
        if (event.type === HttpEventType.Response) {
          return from(
            Promise.resolve().then(async () => {
              let modifiedResponse = event;
              for (const fn of interceptors.response.fns) {
                if (fn) {
                  modifiedResponse = await fn(modifiedResponse, {}, options);
                }
              }
              return modifiedResponse;
            }),
          );
        }
        return of(event);
      }),
      catchError((error) =>
        from(
          Promise.resolve().then(async () => {
            let modifiedError = error;
            for (const fn of interceptors.error.fns) {
              if (fn) {
                modifiedError = await fn(modifiedError, error, req, options);
              }
            }
            throw modifiedError;
          }),
        ),
      ),
    );
  }
}

export function isResponseEvent(
  event: HttpEvent<unknown>,
): event is HttpResponse<unknown> {
  return event.type === HttpEventType.Response;
}

export const mapToResponseStyle = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  source: Observable<HttpEvent<unknown>>,
  requestOptions: RequestOptions<TData, TResponseStyle, ThrowOnError>,
) =>
  source.pipe(
    map((event) => {
      if (!isResponseEvent(event)) {
        return event;
      }

      const result: any = {
        body: event.body as TData,
        headers: event.headers,
        status: event.status,
        statusText: event.statusText,
        url: event.url || undefined,
      };

      if (requestOptions.responseStyle === 'data') {
        return result.body;
      } else if (requestOptions.responseStyle === 'fields') {
        return result;
      }

      return result;
    }),
    catchError((error) => {
      if (requestOptions.throwOnError) {
        return error;
      }

      const errResult: any = {
        error: error.error as TError,
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url || undefined,
      };

      if (requestOptions.responseStyle === 'data') {
        return of(errResult.error);
      } else if (requestOptions.responseStyle === 'fields') {
        return of(errResult);
      }

      return of(errResult);
    }),
  );
