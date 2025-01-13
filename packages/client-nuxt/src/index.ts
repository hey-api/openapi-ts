import type { NuxtApp } from 'nuxt/app';
import {
  useAsyncData,
  useFetch,
  useLazyAsyncData,
  useLazyFetch,
} from 'nuxt/app';

import type { Client, Config } from './types';
import {
  buildUrl,
  createConfig,
  mergeConfigs,
  mergeHeaders,
  setAuthParams,
  unwrapRefs,
} from './utils';

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    return getConfig();
  };

  const request: Client['request'] = ({
    asyncDataOptions,
    composable,
    key,
    ...options
  }) => {
    const opts = {
      ..._config,
      ...options,
      $fetch: options.$fetch ?? _config.$fetch ?? $fetch,
      headers: mergeHeaders(_config.headers, options.headers),
    };

    const { responseTransformer, responseValidator, security } = opts;
    if (security) {
      const _onRequest = opts.onRequest;
      // auth must happen in interceptors otherwise we'd need to require
      // asyncContext enabled
      // https://nuxt.com/docs/guide/going-further/experimental-features#asynccontext
      opts.onRequest = async (context) => {
        const { options } = context;

        await setAuthParams({
          auth: opts.auth,
          headers: options.headers,
          query: options.query,
          security,
        });

        if (typeof _onRequest === 'function') {
          await _onRequest(context);
        }
      };
    }

    if (responseTransformer || responseValidator) {
      const _onResponse = opts.onResponse;
      opts.onResponse = async (context) => {
        const { options, response } = context;

        if (!options.responseType || options.responseType === 'json') {
          if (responseValidator) {
            await responseValidator(response._data);
          }

          if (responseTransformer) {
            response._data = await responseTransformer(response._data);
          }
        }

        if (typeof _onResponse === 'function') {
          await _onResponse(context);
        }
      };
    }

    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (!opts.body) {
      opts.headers.delete('Content-Type');
    }

    const fetchFn = opts.$fetch;

    if (composable === '$fetch') {
      const url = buildUrl(opts);
      return fetchFn(
        url,
        // @ts-expect-error
        unwrapRefs(opts),
      );
    }

    if (composable === 'useFetch') {
      const url = buildUrl(opts);
      return useFetch(url, opts);
    }

    if (composable === 'useLazyFetch') {
      const url = buildUrl(opts);
      return useLazyFetch(url, opts);
    }

    const handler: (ctx?: NuxtApp) => Promise<any> = () => {
      const url = buildUrl(opts);
      return fetchFn(
        url,
        // @ts-expect-error
        unwrapRefs(opts),
      );
    };

    if (composable === 'useAsyncData') {
      return key
        ? useAsyncData(key, handler, asyncDataOptions)
        : useAsyncData(handler, asyncDataOptions);
    }

    if (composable === 'useLazyAsyncData') {
      return key
        ? useLazyAsyncData(key, handler, asyncDataOptions)
        : useLazyAsyncData(handler, asyncDataOptions);
    }

    return undefined as any;
  };

  return {
    buildUrl,
    connect: (options) => request({ ...options, method: 'CONNECT' }),
    delete: (options) => request({ ...options, method: 'DELETE' }),
    get: (options) => request({ ...options, method: 'GET' }),
    getConfig,
    head: (options) => request({ ...options, method: 'HEAD' }),
    options: (options) => request({ ...options, method: 'OPTIONS' }),
    patch: (options) => request({ ...options, method: 'PATCH' }),
    post: (options) => request({ ...options, method: 'POST' }),
    put: (options) => request({ ...options, method: 'PUT' }),
    request,
    setConfig,
    trace: (options) => request({ ...options, method: 'TRACE' }),
  };
};

export type {
  Auth,
  Client,
  Composable,
  Config,
  Options,
  OptionsLegacyParser,
  RequestOptions,
  RequestResult,
} from './types';
export {
  createConfig,
  formDataBodySerializer,
  jsonBodySerializer,
  type QuerySerializerOptions,
  urlSearchParamsBodySerializer,
} from './utils';
