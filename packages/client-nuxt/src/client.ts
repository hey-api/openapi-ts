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
  generateAuthParams,
  mergeConfigs,
  mergeHeaders,
  mergeInterceptors,
  serializeBody,
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
    // Note: it's crucial that anything that might have reactive data (e.g. path params, query params,
    // body, etc) or on-demand data (e.g. auth tokens), is only handled via interceptors. This is
    // because Nuxt composables control when the request is sent (or re-sent) -- we don't invoke the
    // request here. if we do logic outside of interceptors, it has the potential to become stale
    // or cause hydration errors.
    const opts = {
      ..._config,
      ...options,
      $fetch: options.$fetch ?? _config.$fetch ?? $fetch,
      headers: mergeHeaders(_config.headers, options.headers),
      onRequest: mergeInterceptors(
        ({ options: req }) =>
          (req.body = serializeBody({
            ...options,
            bodySerializer: options.bodySerializer ?? _config.bodySerializer,
          })),
        ({ options: req }) => {
          // remove Content-Type header if body is empty to avoid sending invalid requests
          if (req.body === undefined || req.body === '') {
            req.headers.delete('Content-Type');
          }
        },
        _config.onRequest,
        options.onRequest,
      ),
      onResponse: mergeInterceptors(_config.onResponse, options.onResponse),
    };

    const { responseTransformer, responseValidator, security } = opts;
    if (security) {
      opts.onRequest = [
        async ({ options: req }) => {
          const params = await generateAuthParams(security, opts.auth);
          if (params.headers) {
            req.headers = mergeHeaders(req.headers, params.headers);
          }
          req.query = {
            ...req.query,
            ...Object.fromEntries(params.query.entries()),
          };
        },
        ...opts.onRequest,
      ];
    }

    if (responseTransformer || responseValidator) {
      opts.onResponse = [
        ...opts.onResponse,
        async ({ options, response }) => {
          if (options.responseType && options.responseType !== 'json') {
            return;
          }

          if (!response.ok) {
            return;
          }

          if (responseValidator) {
            await responseValidator(response._data);
          }

          if (responseTransformer) {
            response._data = await responseTransformer(response._data);
          }
        },
      ];
    }

    if (composable === '$fetch') {
      return opts.$fetch(
        buildUrl(opts),
        // @ts-expect-error
        opts,
      );
    }

    if (composable === 'useFetch' || composable === 'useLazyFetch') {
      const fetchOpts = {
        ...opts,
        ...asyncDataOptions,
      };

      return composable === 'useLazyFetch'
        ? useLazyFetch(() => buildUrl(opts), fetchOpts)
        : useFetch(() => buildUrl(opts), fetchOpts);
    }

    const handler: any = () =>
      opts.$fetch(
        buildUrl(opts),
        // @ts-expect-error
        opts,
      );

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
