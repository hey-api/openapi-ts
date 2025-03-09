import type { QuerySerializerOptions } from '@hey-api/client-core';
import {
  getAuthToken,
  jsonBodySerializer,
  serializeArrayParam,
  serializeObjectParam,
  serializePrimitiveParam,
} from '@hey-api/client-core';
import type { ComputedRef, Ref } from 'vue';
import { isRef, toValue, unref } from 'vue';

import type {
  ArraySeparatorStyle,
  BuildUrlOptions,
  Client,
  ClientOptions,
  Config,
  QuerySerializer,
  RequestOptions,
} from './types';

type PathSerializer = Pick<Required<BuildUrlOptions>, 'path' | 'url'>;

const PATH_PARAM_RE = /\{[^{}]+\}/g;

type MaybeArray<T> = T | T[];

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

      const value = toValue(toValue(path)[name]);

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
    let search: string[] = [];
    const qParams = toValue(queryParams);
    if (qParams && typeof qParams === 'object') {
      for (const name in qParams) {
        const value = toValue(qParams[name]);

        if (value === undefined || value === null) {
          continue;
        }

        if (Array.isArray(value)) {
          search = [
            ...search,
            serializeArrayParam({
              allowReserved,
              explode: true,
              name,
              style: 'form',
              value,
              ...array,
            }),
          ];
          continue;
        }

        if (typeof value === 'object') {
          search = [
            ...search,
            serializeObjectParam({
              allowReserved,
              explode: true,
              name,
              style: 'deepObject',
              value: value as Record<string, unknown>,
              ...object,
            }),
          ];
          continue;
        }

        search = [
          ...search,
          serializePrimitiveParam({
            allowReserved,
            name,
            value: value as string,
          }),
        ];
      }
    }
    return search.join('&');
  };
  return querySerializer;
};

export const setAuthParams = async ({
  security,
  ...options
}: Pick<Required<RequestOptions>, 'security'> &
  Pick<RequestOptions, 'auth' | 'query'> & {
    headers: Headers;
  }) => {
  for (const auth of security) {
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
        toValue(options.query)[name] = token;
        break;
      case 'header':
      default:
        options.headers.set(name, token);
        break;
    }

    return;
  }
};

export const buildUrl: Client['buildUrl'] = (options) => {
  const url = getUrl({
    baseUrl: options.baseURL as string,
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
}: Pick<BuildUrlOptions, 'path' | 'query' | 'url'> & {
  baseUrl?: string;
  querySerializer: QuerySerializer;
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
  if (config.baseURL?.endsWith('/')) {
    config.baseURL = config.baseURL.substring(0, config.baseURL.length - 1);
  }
  config.headers = mergeHeaders(a.headers, b.headers);
  return config;
};

export const mergeHeaders = (
  ...headers: Array<Required<Config>['headers'] | undefined>
): Headers => {
  const mergedHeaders = new Headers();
  for (const header of headers) {
    if (!header || typeof header !== 'object') {
      continue;
    }

    let h: unknown = header;
    if (isRef(h)) {
      h = unref(h);
    }

    const iterator =
      h instanceof Headers
        ? h.entries()
        : Object.entries(h as Record<string, unknown>);

    for (const [key, value] of iterator) {
      if (value === null) {
        mergedHeaders.delete(key);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          mergedHeaders.append(key, unwrapRefs(v) as string);
        }
      } else if (value !== undefined) {
        const v = unwrapRefs(value);
        // assume object headers are meant to be JSON stringified, i.e. their
        // content value in OpenAPI specification is 'application/json'
        mergedHeaders.set(
          key,
          typeof v === 'object' ? JSON.stringify(v) : (v as string),
        );
      }
    }
  }
  return mergedHeaders;
};

export const mergeInterceptors = <T>(...args: Array<MaybeArray<T>>): Array<T> =>
  args.reduce<Array<T>>((acc, item) => {
    if (typeof item === 'function') {
      acc.push(item);
    } else if (Array.isArray(item)) {
      return acc.concat(item);
    }
    return acc;
  }, []);

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
  querySerializer: defaultQuerySerializer,
  ...override,
});

type UnwrapRefs<T> =
  T extends Ref<infer V>
    ? V
    : T extends ComputedRef<infer V>
      ? V
      : T extends Record<string, unknown> // this doesn't handle functions well
        ? { [K in keyof T]: UnwrapRefs<T[K]> }
        : T;

const unwrapRefs = <T>(value: T): UnwrapRefs<T> => {
  if (value === null || typeof value !== 'object' || value instanceof Headers) {
    return (isRef(value) ? unref(value) : value) as UnwrapRefs<T>;
  }

  if (Array.isArray(value)) {
    return value.map((item) => unwrapRefs(item)) as UnwrapRefs<T>;
  }

  if (isRef(value)) {
    return unwrapRefs(unref(value) as T);
  }

  // unwrap into new object to avoid modifying the source
  const result: Record<string, unknown> = {};
  for (const key in value) {
    result[key] = unwrapRefs(value[key] as T);
  }
  return result as UnwrapRefs<T>;
};

export const serializeBody = (
  opts: Pick<Parameters<Client['request']>[0], 'body' | 'bodySerializer'>,
) => {
  if (opts.body && opts.bodySerializer) {
    return opts.bodySerializer(opts.body);
  }
  return opts.body;
};

export const executeFetchFn = (
  opts: Omit<Parameters<Client['request']>[0], 'composable'>,
  fetchFn: Required<Config>['$fetch'],
) => {
  const unwrappedOpts = unwrapRefs(opts);
  unwrappedOpts.body = serializeBody(unwrappedOpts);
  return fetchFn(
    buildUrl(opts),
    // @ts-expect-error
    unwrappedOpts,
  );
};
