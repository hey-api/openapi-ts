import type { KyInstance, Options as KyOptions } from 'ky';

import type { Auth } from '../../client-core/bundle/auth';
import type {
  ServerSentEventsOptions,
  ServerSentEventsResult,
} from '../../client-core/bundle/serverSentEvents';
import type {
  Client as CoreClient,
  Config as CoreConfig,
} from '../../client-core/bundle/types';
import type { Middleware } from './utils';

export type ResponseStyle = 'data' | 'fields';

export interface Config<T extends ClientOptions = ClientOptions>
  extends Omit<
      KyOptions,
      'body' | 'headers' | 'method' | 'prefixUrl' | 'throwHttpErrors'
    >,
    CoreConfig {
  baseUrl?: T['baseUrl'];
  ky?: KyInstance;
  parseAs?:
    | 'arrayBuffer'
    | 'auto'
    | 'blob'
    | 'formData'
    | 'json'
    | 'stream'
    | 'text';
  responseStyle?: ResponseStyle;
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
  body?: BodyInit | null;
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
> = ThrowOnError extends true
  ? Promise<
      TResponseStyle extends 'data'
        ? TData extends Record<string, unknown>
          ? TData[keyof TData]
          : TData
        : {
            data: TData extends Record<string, unknown>
              ? TData[keyof TData]
              : TData;
            request: Request;
            response: Response;
          }
    >
  : Promise<
      TResponseStyle extends 'data'
        ?
            | (TData extends Record<string, unknown>
                ? TData[keyof TData]
                : TData)
            | undefined
        : (
            | {
                data: TData extends Record<string, unknown>
                  ? TData[keyof TData]
                  : TData;
                error: undefined;
              }
            | {
                data: undefined;
                error: TError extends Record<string, unknown>
                  ? TError[keyof TError]
                  : TError;
              }
          ) & {
            request: Request;
            response: Response;
          }
    >;

export interface ClientOptions {
  baseUrl?: string;
  responseStyle?: ResponseStyle;
  throwOnError?: boolean;
}

type MethodFn = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: Omit<RequestOptions<TData, TResponseStyle, ThrowOnError>, 'method'>,
) => RequestResult<TData, TError, ThrowOnError, TResponseStyle>;

type SseFn = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: Omit<RequestOptions<TData, TResponseStyle, ThrowOnError>, 'method'>,
) => Promise<ServerSentEventsResult<TData, TError>>;

type RequestFn = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: Omit<RequestOptions<TData, TResponseStyle, ThrowOnError>, 'method'> &
    Pick<
      Required<RequestOptions<TData, TResponseStyle, ThrowOnError>>,
      'method'
    >,
) => RequestResult<TData, TError, ThrowOnError, TResponseStyle>;

type BuildUrlFn = <
  TData extends {
    body?: unknown;
    path?: Record<string, unknown>;
    query?: Record<string, unknown>;
    url: string;
  },
>(
  options: TData & Options<TData>,
) => string;

export type Client = CoreClient<
  RequestFn,
  Config,
  MethodFn,
  BuildUrlFn,
  SseFn
> & {
  interceptors: Middleware<Request, Response, unknown, ResolvedRequestOptions>;
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
  path?: unknown;
  query?: unknown;
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
  ([TData] extends [never] ? unknown : Omit<TData, 'url'>);
