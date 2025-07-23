import type {
  AsyncDataOptions,
  useAsyncData,
  useFetch,
  UseFetchOptions,
  useLazyAsyncData,
  useLazyFetch,
} from 'nuxt/app';
import type { Ref } from 'vue';

import type { Auth } from '../core/auth';
import type { QuerySerializerOptions } from '../core/bodySerializer';
import type {
  Client as CoreClient,
  Config as CoreConfig,
} from '../core/types';

export type ArraySeparatorStyle = ArrayStyle | MatrixStyle;
type ArrayStyle = 'form' | 'spaceDelimited' | 'pipeDelimited';
type MatrixStyle = 'label' | 'matrix' | 'simple';
export type ObjectSeparatorStyle = ObjectStyle | MatrixStyle;
type ObjectStyle = 'form' | 'deepObject';

export type QuerySerializer = (
  query: Parameters<Client['buildUrl']>[0]['query'],
) => string;

type WithRefs<TData> = {
  [K in keyof TData]: NonNullable<TData[K]> extends object
    ? WithRefs<NonNullable<TData[K]>> | Ref<NonNullable<TData[K]>>
    : NonNullable<TData[K]> | Ref<NonNullable<TData[K]>>;
};

// copied from Nuxt
export type KeysOf<T> = Array<
  T extends T ? (keyof T extends string ? keyof T : never) : never
>;

export interface Config<T extends ClientOptions = ClientOptions>
  extends Omit<
      FetchOptions<unknown>,
      'baseURL' | 'body' | 'headers' | 'method' | 'query'
    >,
    WithRefs<Pick<FetchOptions<unknown>, 'query'>>,
    Omit<CoreConfig, 'querySerializer'> {
  /**
   * Base URL for all requests made by this client.
   */
  baseURL?: T['baseURL'];
  /**
   * A function for serializing request query parameters. By default, arrays
   * will be exploded in form style, objects will be exploded in deepObject
   * style, and reserved characters are percent-encoded.
   *
   * {@link https://swagger.io/docs/specification/serialization/#query View examples}
   */
  querySerializer?: QuerySerializer | QuerySerializerOptions;
}

export interface RequestOptions<
  TComposable extends Composable = Composable,
  ResT = unknown,
  DefaultT = undefined,
  Url extends string = string,
> extends Config,
    WithRefs<{
      /**
       * Any body that you want to add to your request.
       *
       * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
       */
      body?: unknown;
      path?: FetchOptions<unknown>['query'];
      query?: FetchOptions<unknown>['query'];
    }> {
  asyncDataOptions?: AsyncDataOptions<ResT, ResT, KeysOf<ResT>, DefaultT>;
  composable: TComposable;
  key?: string;
  /**
   * Security mechanism(s) to use for the request.
   */
  security?: ReadonlyArray<Auth>;
  url: Url;
}

export type RequestResult<
  TComposable extends Composable,
  ResT,
  TError,
> = TComposable extends '$fetch'
  ? ReturnType<typeof $fetch<ResT>>
  : TComposable extends 'useAsyncData'
    ? ReturnType<typeof useAsyncData<ResT | null, TError>>
    : TComposable extends 'useFetch'
      ? ReturnType<typeof useFetch<ResT | null, TError>>
      : TComposable extends 'useLazyAsyncData'
        ? ReturnType<typeof useLazyAsyncData<ResT | null, TError>>
        : TComposable extends 'useLazyFetch'
          ? ReturnType<typeof useLazyFetch<ResT | null, TError>>
          : never;

export interface ClientOptions {
  baseURL?: string;
}

type MethodFn = <
  TComposable extends Composable,
  ResT = unknown,
  TError = unknown,
  DefaultT = undefined,
>(
  options: Omit<RequestOptions<TComposable, ResT, DefaultT>, 'method'>,
) => RequestResult<TComposable, ResT, TError>;

type RequestFn = <
  TComposable extends Composable,
  ResT = unknown,
  TError = unknown,
  DefaultT = undefined,
>(
  options: Omit<RequestOptions<TComposable, ResT, DefaultT>, 'method'> &
    Pick<Required<RequestOptions<TComposable, ResT, DefaultT>>, 'method'>,
) => RequestResult<TComposable, ResT, TError>;

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
  path?: FetchOptions<unknown>['query'];
  query?: FetchOptions<unknown>['query'];
  url: string;
}

export type BuildUrlOptions<
  TData extends Omit<TDataShape, 'headers'> = Omit<TDataShape, 'headers'>,
> = Pick<WithRefs<TData>, 'path' | 'query'> &
  Pick<TData, 'url'> &
  Pick<Options<'$fetch', TData>, 'baseURL' | 'querySerializer'>;

type BuildUrlFn = <TData extends Omit<TDataShape, 'headers'>>(
  options: BuildUrlOptions<TData>,
) => string;

export type Client = CoreClient<RequestFn, Config, MethodFn, BuildUrlFn>;

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Options<
  TComposable extends Composable,
  TData extends TDataShape = TDataShape,
  ResT = unknown,
  DefaultT = undefined,
> = OmitKeys<
  RequestOptions<TComposable, ResT, DefaultT>,
  'body' | 'path' | 'query' | 'url'
> &
  WithRefs<Omit<TData, 'url'>>;

export type OptionsLegacyParser<TData = unknown> = TData extends { body?: any }
  ? TData extends { headers?: any }
    ? OmitKeys<RequestOptions, 'body' | 'headers' | 'url'> & TData
    : OmitKeys<RequestOptions, 'body' | 'url'> &
        TData &
        Pick<RequestOptions, 'headers'>
  : TData extends { headers?: any }
    ? OmitKeys<RequestOptions, 'headers' | 'url'> &
        TData &
        Pick<RequestOptions, 'body'>
    : OmitKeys<RequestOptions, 'url'> & TData;

type FetchOptions<TData> = Omit<
  UseFetchOptions<TData, TData>,
  keyof AsyncDataOptions<TData>
>;

export type Composable =
  | '$fetch'
  | 'useAsyncData'
  | 'useFetch'
  | 'useLazyAsyncData'
  | 'useLazyFetch';
