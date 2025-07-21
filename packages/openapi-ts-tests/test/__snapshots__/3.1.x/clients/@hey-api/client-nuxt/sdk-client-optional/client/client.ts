import {
  useAsyncData,
  useFetch,
  useLazyAsyncData,
  useLazyFetch,
} from 'nuxt/app';
import { reactive, ref, watch } from 'vue';

import type { Client, Config } from './types';
import {
  buildUrl,
  createConfig,
  executeFetchFn,
  mergeConfigs,
  mergeHeaders,
  mergeInterceptors,
  serializeBody,
  setAuthParams,
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
    ...options
  }) => {
    const key = options.key;
    const opts = {
      ..._config,
      ...options,
      $fetch: options.$fetch ?? _config.$fetch ?? $fetch,
      headers: mergeHeaders(_config.headers, options.headers),
      onRequest: mergeInterceptors(_config.onRequest, options.onRequest),
      onResponse: mergeInterceptors(_config.onResponse, options.onResponse),
    };

    const {
      requestValidator,
      responseTransformer,
      responseValidator,
      security,
    } = opts;
    if (requestValidator || security) {
      // auth must happen in interceptors otherwise we'd need to require
      // asyncContext enabled
      // https://nuxt.com/docs/guide/going-further/experimental-features#asynccontext
      opts.onRequest = [
        async ({ options }) => {
          if (security) {
            await setAuthParams({
              auth: opts.auth,
              headers: options.headers,
              query: options.query,
              security,
            });
          }

          if (requestValidator) {
            await requestValidator(options);
          }
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

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (opts.body === undefined || opts.body === '') {
      opts.headers.delete('Content-Type');
    }

    const fetchFn = opts.$fetch;

    if (composable === '$fetch') {
      return executeFetchFn(opts, fetchFn);
    }

    if (composable === 'useFetch' || composable === 'useLazyFetch') {
      const bodyParams = reactive({
        body: opts.body,
        bodySerializer: opts.bodySerializer,
      });
      const body = ref(serializeBody(opts));
      opts.body = body;
      watch(bodyParams, (changed) => {
        body.value = serializeBody(changed);
      });
      return composable === 'useLazyFetch'
        ? useLazyFetch(() => buildUrl(opts), opts)
        : useFetch(() => buildUrl(opts), opts);
    }

    const handler: any = () => executeFetchFn(opts, fetchFn);

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
