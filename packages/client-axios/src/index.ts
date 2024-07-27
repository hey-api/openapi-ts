import axios, { AxiosError } from 'axios';

import type { Client, Config, RequestOptions } from './types';
import { createDefaultConfig, getUrl, mergeHeaders } from './utils';

let globalConfig = createDefaultConfig();

export const createClient = (config: Config): Client => {
  const defaultConfig = createDefaultConfig();
  const _config = { ...defaultConfig, ...config };

  _config.headers = mergeHeaders(defaultConfig.headers, _config.headers);

  if (_config.global) {
    globalConfig = { ..._config };
  }

  // @ts-ignore
  const getConfig = () => (_config.root ? globalConfig : _config);

  const instance = axios.create(config);

  // @ts-ignore
  const request: Client['request'] = async (options) => {
    const config = getConfig();

    const opts: RequestOptions = {
      ...config,
      ...options,
      // @ts-ignore
      headers: mergeHeaders(config.headers, options.headers),
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
      return Promise.reject({
        ...error,
        error: e.response?.data ?? {},
      });
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
  };
};

export const client = createClient({
  ...globalConfig,
  // @ts-ignore
  root: true,
});
