import type { QuerySerializerOptions } from '@hey-api/client-core';
import {
  getAuthToken,
  jsonBodySerializer,
  serializeArrayParam,
  serializeObjectParam,
  serializePrimitiveParam,
} from '@hey-api/client-core';
import { toValue } from 'vue';

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

const defaultPathSerializer = ({ path, url: _url }: PathSerializer) => {
  // TODO: type has potentially double-wrapped Ref, even though I don't think
  // it's actually double wrapped. Harmless, but should look into it.
  const pathValue = toValue(toValue(path));
  let url = _url;

  if (!pathValue) return url;

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

      const value = toValue(pathValue[name]);
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
    const search: string[] = [];
    const qParams = toValue(queryParams);
    if (qParams && typeof qParams === 'object') {
      for (const name in qParams) {
        const value = toValue(qParams[name]);

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

export const generateAuthParams = async (
  security: NonNullable<RequestOptions['security']>,
  auth: RequestOptions['auth'],
) => {
  const results = {
    headers: new Headers(),
    query: new URLSearchParams(),
  };

  for (const sauth of security) {
    const token = await getAuthToken(sauth, auth);

    if (!token) {
      continue;
    }

    const name = sauth.name ?? 'Authorization';

    switch (sauth.in) {
      case 'query':
        results.query.append(name, token);
        break;
      case 'cookie':
        results.headers.append('Cookie', `${name}=${token}`);
        break;
      case 'header':
      default:
        results.headers.set(name, token);
        break;
    }
    return results;
  }
  return results;
};

export const buildUrl: Client['buildUrl'] = (options) =>
  getUrl({
    baseUrl: options.baseURL as string,
    path: options.path,
    query: options.query,
    querySerializer:
      typeof options.querySerializer === 'function'
        ? options.querySerializer
        : createQuerySerializer(options.querySerializer),
    url: options.url,
  });

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

/**
 * Merges headers from multiple sources. Lowercases header names, to match
 * the behavior of ofetch/nuxt.
 * @param headers - The headers to merge.
 * @returns A new Headers object with the merged headers.
 */
export const mergeHeaders = (
  ...headers: Array<
    RequestOptions['headers'] | Record<string, unknown> | undefined
  >
): Headers => {
  const mergedHeaders = new Headers();

  for (const header of headers) {
    const h = toValue(header);
    if (!h || typeof h !== 'object') {
      continue;
    }

    const iterator =
      h instanceof Headers
        ? h.entries()
        : Object.entries(h as Record<string, unknown>);

    for (const [key, value] of iterator) {
      if (value === null) {
        mergedHeaders.delete(key.toLowerCase());
      } else if (Array.isArray(value)) {
        for (const v of value) {
          mergedHeaders.append(key.toLowerCase(), toValue(v) as string);
        }
      } else if (value !== undefined) {
        const v = toValue(value);
        // assume object headers are meant to be JSON stringified, i.e. their
        // content value in OpenAPI specification is 'application/json'
        mergedHeaders.set(
          key.toLowerCase(),
          typeof v === 'object' ? JSON.stringify(v) : (v as string),
        );
      }
    }
  }
  return mergedHeaders;
};

export const mergeInterceptors = <T>(...args: Array<T | T[]>): Array<T> =>
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
} as const;

export const createConfig = <T extends ClientOptions = ClientOptions>(
  override: Config<Omit<ClientOptions, keyof T> & T> = {},
): Config<Omit<ClientOptions, keyof T> & T> => ({
  ...jsonBodySerializer,
  headers: defaultHeaders,
  querySerializer: defaultQuerySerializer,
  ...override,
});

export const serializeBody = (
  opts: Pick<Parameters<Client['request']>[0], 'body' | 'bodySerializer'>,
) => {
  if (opts.body && opts.bodySerializer) {
    return opts.bodySerializer(toValue(opts.body));
  }
  return toValue(opts.body);
};
