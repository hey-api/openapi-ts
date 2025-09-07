import {
  HttpClient,
  HttpContextToken,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';

import type { HttpMethod } from '../../client-core/bundle/types';
import type {
  Client,
  Config,
  Options,
  RequestOptions,
  ResponseStyle,
  SseFn,
  TDataShape,
} from './types';
import {
  createConfig,
  createQuerySerializer,
  getUrl,
  mapToResponseStyle,
  mergeConfigs,
  mergeHeaders,
} from './utils';

// default injection token for the client (allows replacing impl and multiple clients)
export const DEFAULT_HEY_API_CLIENT = new InjectionToken<HeyApiClient>(
  'HEY_API_CLIENT',
);
export const HEY_API_CONTEXT = new HttpContextToken(() => ({}));

/**
 * Provide HeyApiClient with the given configuration.
 * @param userConfig
 * @returns
 */
export function provideHeyApiClient(userConfig: Config) {
  const Klass = userConfig.client ?? HeyApiClient;

  return {
    deps: [],
    provide: DEFAULT_HEY_API_CLIENT,
    useFactory: () => new Klass(userConfig),
  };
}

export class HeyApiSseClient implements Record<HttpMethod, SseFn> {
  constructor(private client: Client) {
    console.log(this.client);
  }

  makeSseFn =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_method: Uppercase<HttpMethod>) =>
      <
        TData = unknown,
        TResponseStyle extends ResponseStyle = 'fields',
        ThrowOnError extends boolean = false,
      >(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _options: RequestOptions<TData, TResponseStyle, ThrowOnError>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _overrides?: HttpRequest<any>,
      ): never => {
        throw new Error('Method not implemented.');
        // TODO: Also done thru interceptor
        // const requestOptions =  this.beforeRequest(options);
        // return createSseClient({
        //   ...requestOptions,
        //   body: requestOptions.body as BodyInit | null | undefined,
        //   headers: requestOptions.headers as unknown as Record<string, string>,
        //   method,
        //   url,
        // });
      };

  connect = this.makeSseFn('CONNECT');
  delete = this.makeSseFn('DELETE');
  get = this.makeSseFn('GET');
  head = this.makeSseFn('HEAD');
  options = this.makeSseFn('OPTIONS');
  patch = this.makeSseFn('PATCH');
  post = this.makeSseFn('POST');
  put = this.makeSseFn('PUT');
  trace = this.makeSseFn('TRACE');
}

@Injectable({ providedIn: 'root' })
export class HeyApiClient implements Client {
  #config: Config;
  #httpClient = inject(HttpClient);
  sse: HeyApiSseClient = new HeyApiSseClient(this);

  constructor(readonly userConfig: Config) {
    this.#config = mergeConfigs(createConfig(), userConfig);
  }

  getConfig(): Config {
    return { ...this.#config };
  }

  setConfig(config: Config): Config {
    this.#config = mergeConfigs(this.#config, config);
    return this.getConfig();
  }

  buildUrl(
    options: Pick<TDataShape, 'url'> &
      Pick<
        Options<TDataShape>,
        'baseUrl' | 'path' | 'query' | 'querySerializer'
      >,
  ) {
    return getUrl({
      baseUrl: options.baseUrl as string,
      path: options.path,
      query: options.query,
      querySerializer:
        typeof options.querySerializer === 'function'
          ? options.querySerializer
          : createQuerySerializer(options.querySerializer),
      url: options.url,
    });
  }

  request<
    TResponseBody,
    ThrowOnError extends boolean = false,
    TResponseStyle extends ResponseStyle = 'fields',
  >(
    userOptions: RequestOptions<any, TResponseStyle, ThrowOnError>,
    overrides?: HttpRequest<TDataShape>,
  ) {
    const req = this.requestOptions(userOptions, overrides);

    const stream$ = this.#httpClient.request<TResponseBody>(req);
    mapToResponseStyle(stream$, userOptions);

    return stream$;
  }

  requestOptions<
    TRequestBody,
    ThrowOnError extends boolean = false,
    TResponseStyle extends ResponseStyle = 'fields',
  >(
    userOptions: RequestOptions<TDataShape, TResponseStyle, ThrowOnError>,
    overrides?: HttpRequest<TDataShape>,
  ): HttpRequest<TRequestBody> {
    const bodyToUse = overrides?.body ?? userOptions.body;

    const requestOptions = {
      ...this.#config,
      ...userOptions,
      body:
        bodyToUse && userOptions.bodySerializer
          ? userOptions.bodySerializer(bodyToUse)
          : bodyToUse,
      headers: mergeHeaders(
        this.#config.headers,
        userOptions.headers,
        overrides?.headers,
      ),
      method:
        overrides?.method ?? userOptions.method ?? this.#config.method ?? 'GET',
      url: overrides?.url ?? this.buildUrl(userOptions),
    };

    if (requestOptions.body === undefined || requestOptions.body === '') {
      requestOptions.headers?.delete('Content-Type');
    }

    const { body, method, url, ...init } = requestOptions;

    const initOverrides = { ...overrides };
    delete initOverrides.method;
    delete initOverrides.url;
    delete initOverrides.body;

    const req = new HttpRequest<TRequestBody>(
      method ?? 'GET',
      url,
      body ?? null,
      {
        redirect: 'follow',
        ...init,
        ...initOverrides,
      },
    );

    req.context.set(HEY_API_CONTEXT, {
      overrides,
      requestOptions,
    });

    // TODO: Move firstValueFrom to config and include in sdks

    // result.response = await firstValueFrom(
    //   opts
    //     .httpClient!.request(req)
    //     .pipe(filter((event: any): event is HttpResponse<unknown> => event.type === HttpEventType.Response)),
    // );

    //// RESPONSE

    // TODO: Move this to interceptor
    // if (opts.responseValidator) {
    //   await opts.responseValidator(bodyResponse);
    // }

    // if (opts.responseTransformer) {
    //   bodyResponse = await opts.responseTransformer(bodyResponse);
    // }
    return req;
  }

  beforeRequest = async (options: RequestOptions) => {
    const requestOptions = this.requestOptions(options);

    // TODO: Move this to interceptor
    // if (requestOptions.security) {
    //   await setAuthParams({
    //     ...requestOptions,
    //     security: requestOptions.security,
    //   });
    // }

    // if (requestOptions.requestValidator) {
    //   await requestOptions.requestValidator(requestOptions);
    // }

    return requestOptions;
  };

  makeMethodFn =
    (method: Uppercase<HttpMethod>) =>
    <
      TData = unknown,
      TResponseStyle extends ResponseStyle = 'fields',
      ThrowOnError extends boolean = false,
    >(
      options: RequestOptions<TData, TResponseStyle, ThrowOnError>,
      overrides?: HttpRequest<any>,
    ) =>
      this.request({ ...options, method }, overrides);

  connect = this.makeMethodFn('CONNECT');
  delete = this.makeMethodFn('DELETE');
  get = this.makeMethodFn('GET');
  head = this.makeMethodFn('HEAD');
  options = this.makeMethodFn('OPTIONS');
  patch = this.makeMethodFn('PATCH');
  post = this.makeMethodFn('POST');
  put = this.makeMethodFn('PUT');
  trace = this.makeMethodFn('TRACE');
}
