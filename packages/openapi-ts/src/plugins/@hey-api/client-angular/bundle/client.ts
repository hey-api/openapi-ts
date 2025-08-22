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

import { createSseClient } from '../../client-core/bundle/serverSentEvents';
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
    options: RequestOptions<unknown, TResponseStyle, ThrowOnError>,
  ) => {
    const opts = {
      ..._config,
      ...options,
      headers: mergeHeaders(_config.headers, options.headers),
      httpClient: options.httpClient ?? _config.httpClient,
      method: 'GET',
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
      opts.method,
      url,
      opts.serializedBody || null,
      {
        redirect: 'follow',
        ...opts,
      },
    );

    return { opts, req, url };
  };

  const beforeRequest = async (options: RequestOptions) => {
    const { opts, req, url } = requestOptions(options);

    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security,
      });
    }

    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    return { opts, req, url };
  };

  const request: Client['request'] = async (options) => {
    // @ts-expect-error
    const { opts, req: initialReq } = await beforeRequest(options);

    let req = initialReq;

    for (const fn of interceptors.request._fns) {
      if (fn) {
        req = await fn(req, opts as any);
      }
    }

    let response;
    const result = {
      request: req,
      response,
    };

    try {
      response = await firstValueFrom(
        opts
          .httpClient!.request(req)
          .pipe(filter((event) => event.type === HttpEventType.Response)),
      );

      for (const fn of interceptors.response._fns) {
        if (fn) {
          response = await fn(response, req, opts as any);
        }
      }

      let bodyResponse: any = response.body;

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
        response = error;
      }

      let finalError = error instanceof HttpErrorResponse ? error.error : error;

      for (const fn of interceptors.error._fns) {
        if (fn) {
          finalError = (await fn(
            finalError,
            response as HttpResponse<unknown>,
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

  const makeMethod = (method: Required<Config>['method']) => {
    const fn = (options: RequestOptions) => request({ ...options, method });
    fn.sse = async (options: RequestOptions) => {
      const { opts, url } = await beforeRequest(options);
      return createSseClient({
        ...opts,
        body: opts.body as BodyInit | null | undefined,
        headers: opts.headers as unknown as Record<string, string>,
        method,
        url,
      });
    };
    return fn;
  };

  return {
    buildUrl,
    connect: makeMethod('CONNECT'),
    delete: makeMethod('DELETE'),
    get: makeMethod('GET'),
    getConfig,
    head: makeMethod('HEAD'),
    interceptors,
    options: makeMethod('OPTIONS'),
    patch: makeMethod('PATCH'),
    post: makeMethod('POST'),
    put: makeMethod('PUT'),
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
    trace: makeMethod('TRACE'),
  } as Client;
};
