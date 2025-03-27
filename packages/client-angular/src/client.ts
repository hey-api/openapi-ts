import type { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClient,
  HttpHeaders,
  type HttpResponse,
} from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { Client, Config } from './types';
import {
  buildUrl,
  createConfig,
  mergeConfigs,
  mergeHeaders,
  setAuthParams,
} from './utils';

export let _defaultHttpClient: HttpClient;

export function provideHeyApiClient() {
  console.log('@hey-api will init');
  return provideAppInitializer(() => {
    console.log('@hey-api client initialized');
    _defaultHttpClient = inject(HttpClient);
  });
}

export function updateHeyApiHttpClient(httpClient: HttpClient) {
  console.log('@hey-api httpClient updated');
  _defaultHttpClient = httpClient;
}

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    return getConfig();
  };

  const request: Client['request'] = async (options) => {
    const opts = {
      ..._config,
      ...options,
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

    // Remove Content-Type header if body is empty to avoid sending invalid requests
    if (!opts.body) {
      opts.headers.delete('Content-Type');
    }

    const url = buildUrl(opts);
    const _httpClient = opts.httpClient ?? _defaultHttpClient;

    try {
      // Return the raw HTTP response directly
      const response = (await firstValueFrom(
        _httpClient.request(opts.method ?? 'GET', url, {
          body: opts.body,
          headers: new HttpHeaders(opts.headers),
          observe: 'response' as const, // Ensures we get the full HttpResponse
          // responseType: opts.responseType ?? 'json' as 'json' | 'text' | 'blob',
          responseType: 'json',
          // withCredentials: opts.withCredentials ?? false,
        }),
      )) as HttpResponse<any>;

      return {
        data: response.body,
        response,
      } as any;
    } catch (err) {
      if (opts.throwOnError) {
        throw err;
      }

      const error = err as HttpErrorResponse;

      return {
        error: error.error,
        response: err as HttpErrorResponse,
      } as any;
    }
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
