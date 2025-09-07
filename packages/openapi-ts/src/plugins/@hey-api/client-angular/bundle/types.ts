import type {
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import type { InjectionToken, Injector } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Auth } from '../../client-core/bundle/auth';
import type {
  ServerSentEventsOptions,
  ServerSentEventsResult,
} from '../../client-core/bundle/serverSentEvents';
import type {
  Client as CoreClient,
  Config as CoreConfig,
} from '../../client-core/bundle/types';
import type { HeyApiClient } from './client';

export type ResponseStyle = 'data' | 'fields';

export interface Config<T extends ClientOptions = ClientOptions>
  extends Omit<RequestInit, 'body' | 'headers' | 'method'>,
    Omit<CoreConfig, 'headers'> {
  /**
   * Base URL for all requests made by this client.
   */
  baseUrl?: T['baseUrl'];

  /**
   * Custom HeyApi client. Either with your own implementation or as n-th additional client.
   * @default HeyApiClient
   */
  client?: { new (): HeyApiClient };
  /**
   * An object containing any HTTP headers that you want to pre-populate your
   * `HttpHeaders` object with.
   *
   * {@link https://angular.dev/api/common/http/HttpHeaders#constructor See more}
   */
  headers?:
    | HttpHeaders
    | Record<
        string,
        | string
        | number
        | boolean
        | (string | number | boolean)[]
        | null
        | undefined
        | unknown
      >;

  /**
   * Under which injection token to provide the client.
   * @default DEFAULT_HEY_API_CLIENT
   */
  provide?: InjectionToken<HeyApiClient>;

  /**
   * Should we return only data or multiple fields (data, error, response, etc.)?
   *
   * @default 'fields'
   */
  responseStyle?: ResponseStyle;

  /**
   * Throw an error instead of returning it in the response?
   *
   * @default false
   */
  throwOnError?: T['throwOnError'];
}

export interface RequestOptions<
  TData = unknown,
  TResponseStyle extends ResponseStyle = 'fields',
  ThrowOnError extends boolean = boolean,
  Url extends string = string,
> extends Config<{
      responseStyle: TResponseStyle;
      throwOnError: ThrowOnError;
    }>,
    Pick<
      ServerSentEventsOptions<TData>,
      | 'onSseError'
      | 'onSseEvent'
      | 'sseDefaultRetryDelay'
      | 'sseMaxRetryAttempts'
      | 'sseMaxRetryDelay'
    > {
  /**
   * Any body that you want to add to your request.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
   */
  body?: unknown;
  /**
   * Optional custom injector for dependency resolution if you don't implicitly or explicitly provide one.
   */
  injector?: Injector;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  /**
   * Security mechanism(s) to use for the request.
   */
  security?: ReadonlyArray<Auth>;
  url: Url;
}

export interface ResolvedRequestOptions<
  TResponseStyle extends ResponseStyle = 'fields',
  ThrowOnError extends boolean = boolean,
  Url extends string = string,
> extends RequestOptions<unknown, TResponseStyle, ThrowOnError, Url> {
  serializedBody?: string;
}

export type RequestResult<
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = boolean,
  TResponseStyle extends ResponseStyle = 'fields',
> = Promise<
  ThrowOnError extends true
    ? TResponseStyle extends 'data'
      ? TData extends Record<string, unknown>
        ? TData[keyof TData]
        : TData
      : {
          data: TData extends Record<string, unknown>
            ? TData[keyof TData]
            : TData;
          request: HttpRequest<unknown>;
          response: HttpResponse<TData>;
        }
    : TResponseStyle extends 'data'
      ?
          | (TData extends Record<string, unknown> ? TData[keyof TData] : TData)
          | undefined
      :
          | {
              data: TData extends Record<string, unknown>
                ? TData[keyof TData]
                : TData;
              error: undefined;
              request: HttpRequest<unknown>;
              response: HttpResponse<TData>;
            }
          | {
              data: undefined;
              error: TError[keyof TError];
              request: HttpRequest<unknown>;
              response: HttpErrorResponse & {
                error: TError[keyof TError] | null;
              };
            }
>;

export interface ClientOptions {
  baseUrl?: string;
  responseStyle?: ResponseStyle;
  throwOnError?: boolean;
}

type MethodFn = <
  TData = unknown,
  // TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: Omit<RequestOptions<TData, TResponseStyle, ThrowOnError>, 'method'>,
) => Observable<HttpEvent<unknown>>;
// TODO: Move to sdk: RequestResult<TData, TError, ThrowOnError, TResponseStyle>

export type SseFn = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: Omit<RequestOptions<TData, TResponseStyle, ThrowOnError>, 'method'>,
) => ServerSentEventsResult<TData, TError>;

type RequestFn = <
  TResponseBody,
  TData = unknown,
  // TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: Omit<RequestOptions<TData, TResponseStyle, ThrowOnError>, 'method'> &
    Pick<
      Required<RequestOptions<TData, TResponseStyle, ThrowOnError>>,
      'method'
    >,
  overrides?: HttpRequest<TDataShape>,
  // TODO: RequestResult may be a a sdk type, here we still stick with HttpEvent
) => Observable<HttpEvent<TResponseBody>>;

type RequestOptionsFn = <
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: RequestOptions<unknown, TResponseStyle, ThrowOnError>,
) => HttpRequest<unknown>;

type BuildUrlFn = <
  TData extends {
    body?: unknown;
    path?: Record<string, unknown>;
    query?: Record<string, unknown>;
    url: string;
  },
>(
  options: Pick<TData, 'url'> & Options<TData>,
) => string;

export type Client = CoreClient<
  RequestFn,
  Config,
  MethodFn,
  BuildUrlFn,
  SseFn
> & {
  // TODO: Move to Angular interceptor
  // interceptors: Middleware<
  //   HttpRequest<unknown>,
  //   HttpResponse<unknown>,
  //   unknown,
  //   ResolvedRequestOptions
  // >;
  requestOptions: RequestOptionsFn;
};

/**
 * The `createClientConfig()` function will be called on client initialization
 * and the returned object will become the client's initial configuration.
 *
 * You may want to initialize your client this way instead of calling
 * `setConfig()`. This is useful for example if you're using Next.js
 * to ensure your client always has the correct values.
 */
export type CreateClientConfig<T extends ClientOptions = ClientOptions> = (
  override?: Config<ClientOptions & T>,
) => Config<Required<ClientOptions> & T>;

export interface TDataShape {
  body?: unknown;
  headers?: unknown;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  url: string;
}

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Options<
  TData extends TDataShape = TDataShape,
  ThrowOnError extends boolean = boolean,
  TResponse = unknown,
  TResponseStyle extends ResponseStyle = 'fields',
> = OmitKeys<
  RequestOptions<TResponse, TResponseStyle, ThrowOnError>,
  'body' | 'path' | 'query' | 'url'
> &
  Omit<TData, 'url'>;

export type OptionsLegacyParser<
  TData = unknown,
  ThrowOnError extends boolean = boolean,
  TResponseStyle extends ResponseStyle = 'fields',
> = TData extends { body?: any }
  ? TData extends { headers?: any }
    ? OmitKeys<
        RequestOptions<unknown, TResponseStyle, ThrowOnError>,
        'body' | 'headers' | 'url'
      > &
        TData
    : OmitKeys<
        RequestOptions<unknown, TResponseStyle, ThrowOnError>,
        'body' | 'url'
      > &
        TData &
        Pick<RequestOptions<unknown, TResponseStyle, ThrowOnError>, 'headers'>
  : TData extends { headers?: any }
    ? OmitKeys<
        RequestOptions<unknown, TResponseStyle, ThrowOnError>,
        'headers' | 'url'
      > &
        TData &
        Pick<RequestOptions<unknown, TResponseStyle, ThrowOnError>, 'body'>
    : OmitKeys<RequestOptions<unknown, TResponseStyle, ThrowOnError>, 'url'> &
        TData;
