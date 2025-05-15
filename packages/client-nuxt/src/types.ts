import type {
  Auth,
  Client as CoreClient,
  Config as CoreConfig,
  QuerySerializerOptions,
} from '@hey-api/client-core';
import type {
  AsyncDataOptions,
  useAsyncData,
  useFetch,
  UseFetchOptions,
  useLazyAsyncData,
  useLazyFetch,
} from 'nuxt/app';
import type { MaybeRefOrGetter } from 'vue';

export type ArraySeparatorStyle = ArrayStyle | MatrixStyle;
type ArrayStyle = 'form' | 'spaceDelimited' | 'pipeDelimited';
type MatrixStyle = 'label' | 'matrix' | 'simple';
export type ObjectSeparatorStyle = ObjectStyle | MatrixStyle;
type ObjectStyle = 'form' | 'deepObject';

export type QuerySerializer = (
  query: Parameters<Client['buildUrl']>[0]['query'],
) => string;

/**
 * KeysOf, copied from Nuxt, is used depending on the composable to "pick" the keys
 * on the return type, so only a sub-set of the data is returned via hydration,
 * making loading more efficient/faster.
 */
export type KeysOf<T> = Array<
  T extends T ? (keyof T extends string ? keyof T : never) : never
>;

export interface Config<T extends ClientOptions = ClientOptions>
  extends Omit<
      FetchOptions,
      'baseURL' | 'body' | 'headers' | 'method' | 'query' | 'path'
    >,
    Omit<CoreConfig, 'querySerializer' | 'headers'> {
  /**
   * Base URL for all requests made by this client.
   */
  baseURL?: T['baseURL'];
  headers?: FetchOptions['headers'];
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
    Pick<RefTDataShape<TDataShape>, 'body' | 'path' | 'query'> {
  asyncDataOptions?: AsyncDataOptions<ResT, ResT, KeysOf<ResT>, DefaultT>;
  /**
   * Any body that you want to add to your request.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
   */
  composable: TComposable;
  headers?: FetchOptions['headers'];
  key?: string;
  /**
   * Security mechanism(s) to use for the request.
   */
  security?: ReadonlyArray<Auth>;
  url: Url;
}

/**
 * RequestResult is the return type of the request method, depending on the specific
 * nuxt composable used.
 */
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

/**
 * MethodFn is the signature of the generic method function (e.g. client.get()).
 */
type MethodFn = <
  TComposable extends Composable,
  ResT = unknown,
  TError = unknown,
  DefaultT = undefined,
>(
  options: Omit<
    RequestOptions<TComposable, ResT, DefaultT>,
    'method' | 'headers'
  > & {
    headers?: FetchOptions['headers'];
  },
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
  body?: FetchOptions['body'];
  headers?: unknown;
  path?: FetchOptions['query'];
  query?: FetchOptions['query'];
  url: string;
}

/**
 * TDataShape is the base type for input data of the request.
 */
export interface RefTDataShape<T>
  extends Omit<TDataShape, 'body' | 'path' | 'query'> {
  body?: T extends { body?: infer B }
    ? MaybeRefOrGetter<B>
    : TDataShape['body'];
  path?: T extends { path?: infer P }
    ? MaybeRefOrGetter<NonNullable<P>>
    : TDataShape['path'];
  query?: T extends { query?: infer Q }
    ? MaybeRefOrGetter<NonNullable<Q>>
    : TDataShape['query'];
}

export type BuildUrlOptions<
  TData extends RefTDataShape<TDataShape> = RefTDataShape<TDataShape>,
> = Pick<TData, 'path' | 'query' | 'url'> &
  Pick<Options<'$fetch', TData>, 'baseURL' | 'querySerializer'>;

type BuildUrlFn<
  TData extends RefTDataShape<TDataShape> = RefTDataShape<TDataShape>,
> = (options: BuildUrlOptions<TData>) => string;

export type Client = CoreClient<RequestFn, Config, MethodFn, BuildUrlFn>;

export type Options<
  TComposable extends Composable,
  TData extends RefTDataShape<TDataShape> = RefTDataShape<TDataShape>,
  ResT = unknown,
  DefaultT = undefined,
> = Omit<
  RequestOptions<TComposable, ResT, DefaultT>,
  'body' | 'url' | 'query' | 'path'
> &
  Pick<RefTDataShape<TData>, 'body' | 'query' | 'path'> & {
    headers?: FetchOptions['headers'];
  };

export type OptionsLegacyParser<TData = unknown> = TData extends { body?: any }
  ? TData extends { headers?: any }
    ? Omit<RequestOptions, 'body' | 'headers' | 'url'> & TData
    : Omit<RequestOptions, 'body' | 'url'> &
        TData &
        Pick<RequestOptions, 'headers'>
  : TData extends { headers?: any }
    ? Omit<RequestOptions, 'headers' | 'url'> &
        TData &
        Pick<RequestOptions, 'body'>
    : Omit<RequestOptions, 'url'> & TData;

/**
 * FetchOptions are the additional optional args that can be passed to $fetch.
 */
type FetchOptions = Omit<
  UseFetchOptions<unknown, unknown>,
  keyof AsyncDataOptions<unknown>
>;

export type Composable =
  | '$fetch'
  | 'useAsyncData'
  | 'useFetch'
  | 'useLazyAsyncData'
  | 'useLazyFetch';
