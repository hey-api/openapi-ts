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
import type { Ref } from 'vue';

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

export interface Config
  extends Omit<
      FetchOptions<unknown>,
      'baseURL' | 'body' | 'headers' | 'method' | 'query'
    >,
    WithRefs<Pick<FetchOptions<unknown>, 'query'>>,
    Omit<CoreConfig, 'querySerializer'> {
  /**
   * Base URL for all requests made by this client.
   *
   * @default ''
   */
  baseURL?: string;
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
  Url extends string = string,
> extends Config,
    WithRefs<{
      /**
       * Any body that you want to add to your request.
       *
       * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
       */
      body?: BodyInit | Record<string, any> | null;
      path?: FetchOptions<unknown>['query'];
      query?: FetchOptions<unknown>['query'];
    }> {
  asyncDataOptions?: AsyncDataOptions<unknown>;
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
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
  TData,
  TError,
> = TComposable extends '$fetch'
  ? ReturnType<typeof $fetch<TData>>
  : TComposable extends 'useAsyncData'
    ? ReturnType<typeof useAsyncData<TData | null, TError>>
    : TComposable extends 'useFetch'
      ? ReturnType<typeof useFetch<TData | null, TError>>
      : TComposable extends 'useLazyAsyncData'
        ? ReturnType<typeof useLazyAsyncData<TData | null, TError>>
        : TComposable extends 'useLazyFetch'
          ? ReturnType<typeof useLazyFetch<TData | null, TError>>
          : never;

type MethodFn = <
  TComposable extends Composable,
  TData = unknown,
  TError = unknown,
>(
  options: Omit<RequestOptions<TComposable>, 'method'>,
) => RequestResult<TComposable, TData, TError>;

type RequestFn = <
  TComposable extends Composable,
  TData = unknown,
  TError = unknown,
>(
  options: Omit<RequestOptions<TComposable>, 'method'> &
    Pick<Required<RequestOptions<TComposable>>, 'method'>,
) => RequestResult<TComposable, TData, TError>;

/**
 * The `createClientConfig()` function will be called on client initialization
 * and the returned object will become the client's initial configuration.
 *
 * You may want to initialize your client this way instead of calling
 * `setConfig()`. This is useful for example if you're using Next.js
 * to ensure your client always has the correct values.
 */
export type CreateClientConfig = (override?: Config) => Config;

interface DataShape {
  body?: unknown;
  headers?: unknown;
  path?: FetchOptions<unknown>['query'];
  query?: FetchOptions<unknown>['query'];
  url: string;
}

export type BuildUrlOptions<
  TData extends Omit<DataShape, 'headers'> = Omit<DataShape, 'headers'>,
> = Pick<WithRefs<TData>, 'path' | 'query'> &
  Pick<TData, 'url'> &
  Pick<Options<'$fetch', TData>, 'baseURL' | 'querySerializer'>;

type BuildUrlFn = <TData extends Omit<DataShape, 'headers'>>(
  options: BuildUrlOptions<TData>,
) => string;

export type Client = CoreClient<RequestFn, Config, MethodFn, BuildUrlFn>;

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Options<
  TComposable extends Composable,
  TData extends DataShape = DataShape,
> = OmitKeys<RequestOptions<TComposable>, 'body' | 'path' | 'query' | 'url'> &
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
