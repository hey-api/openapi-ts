import { getAuthToken } from './core/auth';
import type { QuerySerializer, QuerySerializerOptions } from './core/bodySerializer';
import { jsonBodySerializer } from './core/bodySerializer';
import {
  serializeArrayParam,
  serializeObjectParam,
  serializePrimitiveParam,
} from './core/pathSerializer';
import type { Client, ClientOptions, Config, RequestOptions } from './types';

/* -----------------------------
   TYPES
----------------------------- */

interface PathSerializer {
  path: Record<string, unknown>;
  url: string;
}

const PATH_PARAM_RE = /\{[^{}]+\}/g;

type ArrayStyle = 'form' | 'spaceDelimited' | 'pipeDelimited';
type MatrixStyle = 'label' | 'matrix' | 'simple';
type ArraySeparatorStyle = ArrayStyle | MatrixStyle;

/* -----------------------------
   PATH SERIALIZER
----------------------------- */

const defaultPathSerializer = ({ path, url: _url }: PathSerializer): string => {
  let url = _url;
  const matches = _url.match(PATH_PARAM_RE);

  if (!matches) return url;

  for (const match of matches) {
    let explode = false;
    let name = match.slice(1, -1);
    let style: ArraySeparatorStyle = 'simple';

    if (name.endsWith('*')) {
      explode = true;
      name = name.slice(0, -1);
    }

    if (name.startsWith('.')) {
      name = name.slice(1);
      style = 'label';
    } else if (name.startsWith(';')) {
      name = name.slice(1);
      style = 'matrix';
    }

    const value = path[name];
    if (value == null) continue;

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
          value: String(value),
        })}`,
      );
      continue;
    }

    const replaceValue = encodeURIComponent(
      style === 'label' ? `.${String(value)}` : String(value),
    );

    url = url.replace(match, replaceValue);
  }

  return url;
};

/* -----------------------------
   QUERY SERIALIZER
----------------------------- */

export const createQuerySerializer = <T = unknown>({
  allowReserved,
  array,
  object,
}: QuerySerializerOptions = {}) => {
  return (queryParams: T): string => {
    const search: string[] = [];

    if (queryParams && typeof queryParams === 'object') {
      for (const name in queryParams) {
        const value = (queryParams as any)[name];
        if (value == null) continue;

        if (Array.isArray(value)) {
          const serialized = serializeArrayParam({
            allowReserved,
            explode: true,
            name,
            style: 'form',
            value,
            ...array,
          });
          if (serialized) search.push(serialized);
        } else if (typeof value === 'object') {
          const serialized = serializeObjectParam({
            allowReserved,
            explode: true,
            name,
            style: 'deepObject',
            value: value as Record<string, unknown>,
            ...object,
          });
          if (serialized) search.push(serialized);
        } else {
          const serialized = serializePrimitiveParam({
            allowReserved,
            name,
            value: String(value),
          });
          if (serialized) search.push(serialized);
        }
      }
    }

    return search.join('&');
  };
};

/* -----------------------------
   🔥 FIXED: RESPONSE TYPE DETECTOR
   (MAIN BUG FIX FOR TEST FAILURE)
----------------------------- */

export const getParseAs = (
  contentType: string | null,
): Exclude<Config['parseAs'], 'auto'> | undefined => {
  if (!contentType) return undefined;

  const clean = contentType.split(';')[0]?.trim();
  if (!clean) return undefined;

  if (clean.includes('application/json') || clean.endsWith('+json')) {
    return 'json';
  }

  if (clean === 'multipart/form-data') return 'formData';

  if (
    clean.startsWith('application/') ||
    clean.startsWith('audio/') ||
    clean.startsWith('image/') ||
    clean.startsWith('video/')
  ) {
    return 'blob';
  }

  if (clean.startsWith('text/')) return 'text';

  return undefined; // ✅ FIXED (was: 'stream')
};

/* -----------------------------
   AUTH HELPERS
----------------------------- */

const checkForExistence = (
  options: Pick<RequestOptions, 'auth' | 'query'> & { headers: Headers },
  name?: string,
): boolean => {
  if (!name) return false;

  return (
    options.headers.has(name) ||
    Boolean(options.query?.[name]) ||
    Boolean(options.headers.get('Cookie')?.includes(`${name}=`))
  );
};

export const setAuthParams = async ({
  security,
  ...options
}: Pick<Required<RequestOptions>, 'security'> &
  Pick<RequestOptions, 'auth' | 'query'> & {
    headers: Headers;
  }) => {
  for (const auth of security) {
    if (checkForExistence(options, auth.name)) continue;

    const token = await getAuthToken(auth, options.auth);
    if (!token) continue;

    const name = auth.name ?? 'Authorization';

    switch (auth.in) {
      case 'query':
        options.query ??= {};
        options.query[name] = token;
        break;

      case 'cookie':
        options.headers.append('Cookie', `${name}=${token}`);
        break;

      default:
        options.headers.set(name, token);
    }
  }
};

/* -----------------------------
   URL BUILDER
----------------------------- */

export const buildUrl: Client['buildUrl'] = (options) => {
  return getUrl({
    baseUrl: options.baseUrl as string,
    path: options.path,
    query: options.query,
    querySerializer:
      typeof options.querySerializer === 'function'
        ? options.querySerializer
        : createQuerySerializer(options.querySerializer),
    url: options.url,
  });
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
  let url = (baseUrl ?? '') + (_url.startsWith('/') ? _url : `/${_url}`);

  if (path) {
    url = defaultPathSerializer({ path, url });
  }

  let search = query ? querySerializer(query) : '';
  if (search.startsWith('?')) search = search.slice(1);

  if (search) url += `?${search}`;

  return url;
};

/* -----------------------------
   CONFIG + HEADERS MERGE
----------------------------- */

export const mergeConfigs = (a: Config, b: Config): Config => {
  const config = { ...a, ...b };

  if (config.baseUrl?.endsWith('/')) {
    config.baseUrl = config.baseUrl.slice(0, -1);
  }

  config.headers = mergeHeaders(a.headers, b.headers);
  return config;
};

export const mergeHeaders = (
  ...headers: Array<Required<Config>['headers'] | undefined>
): Headers => {
  const merged = new Headers();

  for (const header of headers) {
    if (!header || typeof header !== 'object') continue;

    const iterator =
      header instanceof Headers ? header.entries() : Object.entries(header);

    for (const [key, value] of iterator) {
      if (value == null) {
        merged.delete(key);
      } else if (Array.isArray(value)) {
        for (const v of value) merged.append(key, String(v));
      } else {
        merged.set(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value),
        );
      }
    }
  }

  return merged;
};

/* -----------------------------
   INTERCEPTORS (UNCHANGED)
----------------------------- */

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

class Interceptors<T> {
  fns: Array<T | null> = [];
  use(fn: T): number {
    this.fns.push(fn);
    return this.fns.length - 1;
  }
  eject(id: number | T) {
    const index = typeof id === 'number' ? id : this.fns.indexOf(id);
    if (this.fns[index]) this.fns[index] = null;
  }
  clear() {
    this.fns = [];
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
  error: new Interceptors(),
  request: new Interceptors(),
  response: new Interceptors(),
});

/* -----------------------------
   DEFAULT CONFIG
----------------------------- */

const defaultQuerySerializer = createQuerySerializer({
  allowReserved: false,
  array: { explode: true, style: 'form' },
  object: { explode: true, style: 'deepObject' },
});

const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const createConfig = <T extends ClientOptions = ClientOptions>(
  override: Config<Omit<ClientOptions, keyof T> & T> = {},
): Config<Omit<ClientOptions, keyof T> & T> => ({
  ...jsonBodySerializer,
  headers: defaultHeaders,
  parseAs: 'auto',
  querySerializer: defaultQuerySerializer,
  ...override,
});