import type { AxiosError, RawAxiosRequestHeaders } from 'axios';
import axios from 'axios';

import type { Client, Config } from './types';
import {
  buildUrl,
  createConfig,
  mergeConfigs,
  mergeHeaders,
  setAuthParams,
} from './utils';

export const createClient = (config: Config): Client => {
  let _config = mergeConfigs(createConfig(), config);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { auth, ...configWithoutAuth } = _config;
  const instance = axios.create(configWithoutAuth);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    instance.defaults = {
      ...instance.defaults,
      ..._config,
      // @ts-expect-error
      headers: mergeHeaders(instance.defaults.headers, _config.headers),
    };
    return getConfig();
  };

  // @ts-expect-error
  const request: Client['request'] = async (options) => {
    const opts = {
      ..._config,
      ...options,
      axios: options.axios ?? _config.axios ?? instance,
      headers: mergeHeaders(_config.headers, options.headers),
    };

    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security,
      });
    }

    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    const url = buildUrl(opts);

    try {
      // assign Axios here for consistency with fetch
      const _axios = opts.axios;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { auth, ...optsWithoutAuth } = opts;
      const response = await _axios({
        ...optsWithoutAuth,
        data: opts.body,
        headers: opts.headers as RawAxiosRequestHeaders,
        // let `paramsSerializer()` handle query params if it exists
        params: opts.paramsSerializer ? opts.query : undefined,
        url,
      });

      let { data } = response;

      if (opts.responseType === 'json') {
        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }

        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
      }

      return {
        ...response,
        data: data ?? {},
      };
    } catch (error) {
      const e = error as AxiosError;
      if (opts.throwOnError) {
        throw e;
      }
      // @ts-expect-error
      e.error = e.response?.data ?? {};
      return e;
    }
  };

  return {
    buildUrl,
    delete: (options) => request({ ...options, method: 'delete' }),
    get: (options) => request({ ...options, method: 'get' }),
    getConfig,
    head: (options) => request({ ...options, method: 'head' }),
    instance,
    options: (options) => request({ ...options, method: 'options' }),
    patch: (options) => request({ ...options, method: 'patch' }),
    post: (options) => request({ ...options, method: 'post' }),
    put: (options) => request({ ...options, method: 'put' }),
    request,
    setConfig,
  } as Client;
};

export type {
  Auth,
  Client,
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
  urlSearchParamsBodySerializer,
} from './utils';
