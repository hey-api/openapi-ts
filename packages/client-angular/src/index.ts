import type { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { assertInInjectionContext, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import type { Client, Config, RequestOptions } from './types';
import {
  buildUrl,
  createConfig,
  createInterceptors,
  mergeConfigs,
  mergeHeaders,
  setAuthParams,
} from './utils';

type ReqInit = Omit<RequestInit, 'body' | 'headers'> & {
  body?: any;
  headers: ReturnType<typeof mergeHeaders>;
};

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    return getConfig();
  };

  const interceptors = createInterceptors<
    HttpRequest<unknown>,
    HttpResponse<unknown>,
    HttpErrorResponse,
    RequestOptions
  >();

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

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (!opts.body) {
      opts.headers.delete('Content-Type');
    }

    const url = buildUrl(opts);
    const { method, ...requestInit }: ReqInit = {
      redirect: 'follow',
      ...opts,
    };

    let _httpClient = opts.httpClient;

    if (!_httpClient) {
      assertInInjectionContext(request);
      _httpClient = inject(HttpClient);
    }

    let _request = new HttpRequest<unknown>(method, url, requestInit);

    for (const fn of interceptors.request._fns) {
      _request = await fn(_request, opts);
    }
    try {
      let response = await firstValueFrom(
        _httpClient.request(_request).pipe(
          filter((event) => event.type === HttpEventType.Response),
          map((event) => event as HttpResponse<unknown>),
        ),
      );

      for (const fn of interceptors.response._fns) {
        response = await fn(response, _request, opts);
      }

      const result = {
        request: _request,
        response,
      };

      if (response.ok) {
        if (
          response.status === 204 ||
          response.headers.get('Content-Length') === '0'
        ) {
          return {
            data: {},
            ...result,
          };
        }

        // const parseAs =
        //   (opts.parseAs === 'auto'
        //     ? getParseAs(response.headers.get('Content-Type'))
        //     : opts.parseAs) ?? 'json';

        let data = response.body;
        // if (parseAs === 'stream') {
        // return {
        //   data: response.body,
        //   ...result,
        // };
        // }

        // let data = await response[parseAs]();
        // if (parseAs === 'json') {
        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }

        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
        // }

        return {
          data,
          ...result,
        };
      }
    } catch (err) {
      let finalError = err;

      for (const fn of interceptors.error._fns) {
        finalError = await fn(err, err, _request, opts);
      }

      if (opts.throwOnError) {
        throw finalError;
      }

      return {
        error: finalError,
        ...err,
      };
    }
  };

  return {
    buildUrl,
    connect: (options) => request({ ...options, method: 'CONNECT' }),
    delete: (options) => request({ ...options, method: 'DELETE' }),
    get: (options) => request({ ...options, method: 'GET' }),
    getConfig,
    head: (options) => request({ ...options, method: 'HEAD' }),
    interceptors,
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
  Client,
  Config,
  CreateClientConfig,
  Options,
  OptionsLegacyParser,
  RequestOptions,
  RequestResult,
} from './types';
export { createConfig } from './utils';
export type { Auth, QuerySerializerOptions } from '@hey-api/client-core';
export {
  formDataBodySerializer,
  jsonBodySerializer,
  urlSearchParamsBodySerializer,
} from '@hey-api/client-core';
