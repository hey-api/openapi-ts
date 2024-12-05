import type { AxiosError, RawAxiosRequestHeaders } from 'axios';
import axios from 'axios';

import type { Client, Config } from './types';
import { createConfig, getUrl, mergeConfigs, mergeHeaders } from './utils';

export const createClient = (config: Config): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const instance = axios.create(_config);

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
      headers: mergeHeaders(
        _config.headers,
        options.headers,
      ) as RawAxiosRequestHeaders,
    };
    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    const url = getUrl({
      path: opts.path,
      url: opts.url,
    });

    const _axios = opts.axios || instance;

    try {
      const response = await _axios({
        ...opts,
        data: opts.body,
        params: opts.query,
        url,
      });

      let { data } = response;

      if (opts.responseType === 'json' && opts.responseTransformer) {
        data = await opts.responseTransformer(data);
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
