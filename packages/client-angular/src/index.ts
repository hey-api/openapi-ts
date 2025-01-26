import type { HttpRequest } from '@angular/common/http';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { Client, Config } from './types';
import {
  buildUrl,
  createConfig,
  getParseAs,
  mergeConfigs,
  mergeHeaders,
} from './utils';

type ReqInit = Omit<
  Partial<HttpRequest<unknown>>,
  'body' | 'headers' | 'observe'
> & {
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

  // @ts-expect-error
  const request: Client['request'] = async (options) => {
    const { method, ...opts } = {
      ..._config,
      ...options,
      // fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
      headers: mergeHeaders(_config.headers, options.headers),
    };

    // TODO: TBD
    // if (opts.security) {
    //   await setAuthParams({
    //     ...opts,
    //     security: opts.security,
    //   });
    // }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (!opts.body) {
      opts.headers.delete('Content-Type');
    }

    const url = buildUrl(opts);
    const requestInit: ReqInit = {
      redirect: 'follow',
      ...opts,
    };

    // TODO: TBD - angular has native interceptors
    // for (const fn of interceptors.request._fns) {
    //   request = await fn(request, opts);
    // }

    if (!opts.httpClient) {
      throw new Error('You must provide a HttpClient somewhere.');
    }

    console.debug(method, url, { requestInit });
    // TODO: angular hinted multiple times for a promise-based client; let's hope for it
    const response = await firstValueFrom(
      opts.httpClient.request(method, url, {
        // TODO: must be here for the gloriously overtyped constructor calls
        observe: 'response',
        responseType: 'blob',
        ...requestInit,
        headers: new HttpHeaders(opts.headers),
      }),
    );

    if (!isHttpBlobResponse(response)) {
      throw new Error(
        `First value of the response stream is not a 'HttpResponse', make sure you configure the HttpClient using 'withFetch()'`,
      );
    }

    // TODO: Everything below is kind of useless - but maybe it helps compatabillity?

    // TODO: TBD - angular has native interceptors
    // for (const fn of interceptors.response._fns) {
    //   response = await fn(response, request, opts);
    // }

    const result = {
      request,
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

      const parseAs =
        (opts.parseAs === 'auto'
          ? getParseAs(response.headers.get('Content-Type'))
          : opts.parseAs) ?? 'json';

      if (parseAs === 'stream') {
        return {
          data: response.body,
          ...result,
        };
      }

      let data: unknown = response.body;

      if (data) {
        if (parseAs === 'formData') {
          throw new Error(
            "Using parseAs 'formData' is incompatible with the angular client.",
          );
        }

        if (parseAs === 'json') {
          data = JSON.parse(await response.body!.text());

          if (opts.responseValidator) {
            await opts.responseValidator(data);
          }

          if (opts.responseTransformer) {
            data = await opts.responseTransformer(data);
          }
        }
      }

      return {
        data,
        ...result,
      };
    }

    let error = (await response.body?.text()) ?? '';

    try {
      error = JSON.parse(error);
    } catch {
      // noop
    }

    let finalError = error;

    finalError = finalError || ({} as string);

    if (opts.throwOnError) {
      throw finalError;
    }

    return {
      error: finalError,
      ...result,
    };
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

function isHttpBlobResponse(response: any): response is HttpResponse<Blob> {
  return (
    response instanceof HttpResponse &&
    (response.body === null || response.body instanceof Blob)
  );
}

export type {
  Client,
  Config,
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
