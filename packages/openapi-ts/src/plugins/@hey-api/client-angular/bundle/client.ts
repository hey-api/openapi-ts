import type { HttpResponse } from '@angular/common/http';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpRequest,
} from '@angular/common/http';
import {
  assertInInjectionContext,
  inject,
  provideAppInitializer,
  runInInjectionContext,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import type {
  Client,
  Config,
  RequestOptions,
  ResolvedRequestOptions,
  ResponseStyle,
} from './types';
import {
  buildUrl,
  createConfig,
  createInterceptors,
  mergeConfigs,
  mergeHeaders,
  setAuthParams,
} from './utils';

export function provideHeyApiClient(client: Client) {
  return provideAppInitializer(() => {
    const httpClient = inject(HttpClient);
    client.setConfig({ httpClient });
  });
}

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
    unknown,
    ResolvedRequestOptions
  >();

  const requestOptions = <
    ThrowOnError extends boolean = false,
    TResponseStyle extends ResponseStyle = 'fields',
  >(
    options: RequestOptions<TResponseStyle, ThrowOnError>,
  ) => {
    const opts = {
      ..._config,
      ...options,
      headers: mergeHeaders(_config.headers, options.headers),
      httpClient: options.httpClient ?? _config.httpClient,
      serializedBody: options.body as any,
    };

    if (!opts.httpClient) {
      if (opts.injector) {
        opts.httpClient = runInInjectionContext(opts.injector, () =>
          inject(HttpClient),
        );
      } else {
        assertInInjectionContext(requestOptions);
        opts.httpClient = inject(HttpClient);
      }
    }

    if (opts.body && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (opts.serializedBody === undefined || opts.serializedBody === '') {
      opts.headers.delete('Content-Type');
    }

    const url = buildUrl(opts as any);

    const req = new HttpRequest<unknown>(
      opts.method ?? 'GET',
      url,
      opts.serializedBody || null,
      {
        redirect: 'follow',
        ...opts,
      },
    );

    return { opts, req };
  };

  const request: Client['request'] = async (options) => {
    const { opts, req: initialReq } = requestOptions(options);

    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security,
      });
    }

    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    let req = initialReq;

    for (const fn of interceptors.request._fns) {
      if (fn) {
        req = await fn(req, opts as any);
      }
    }

    const result: {
      request: HttpRequest<unknown>;
      response: any;
    } = {
      request: req,
      response: null,
    };

    try {
      result.response = (await firstValueFrom(
        opts
          .httpClient!.request(req)
          .pipe(filter((event) => event.type === HttpEventType.Response)),
      )) as HttpResponse<unknown>;

      for (const fn of interceptors.response._fns) {
        if (fn) {
          result.response = await fn(result.response, req, opts as any);
        }
      }

      let bodyResponse = result.response.body;

      if (opts.responseValidator) {
        await opts.responseValidator(bodyResponse);
      }

      if (opts.responseTransformer) {
        bodyResponse = await opts.responseTransformer(bodyResponse);
      }

      return opts.responseStyle === 'data'
        ? bodyResponse
        : { data: bodyResponse, ...result };
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        result.response = error;
      }

      let finalError = error instanceof HttpErrorResponse ? error.error : error;

      for (const fn of interceptors.error._fns) {
        if (fn) {
          finalError = (await fn(
            finalError,
            result.response as any,
            req,
            opts as any,
          )) as string;
        }
      }

      if (opts.throwOnError) {
        throw finalError;
      }

      return opts.responseStyle === 'data'
        ? undefined
        : {
            error: finalError,
            ...result,
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
    requestOptions: (options) => {
      if (options.security) {
        throw new Error('Security is not supported in requestOptions');
      }

      if (options.requestValidator) {
        throw new Error(
          'Request validation is not supported in requestOptions',
        );
      }

      return requestOptions(options).req;
    },
    setConfig,
    trace: (options) => request({ ...options, method: 'TRACE' }),
  };
};
