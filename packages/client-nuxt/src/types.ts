import type {
  AsyncDataOptions,
  useAsyncData,
  useFetch,
  UseFetchOptions,
  useLazyAsyncData,
  useLazyFetch,
} from 'nuxt/app';
import type { Ref } from 'vue';

import type {
  BodySerializer,
  QuerySerializer,
  QuerySerializerOptions,
} from './utils';

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

type WithRefs<TData> = {
  [K in keyof TData]: TData[K] extends object
    ? WithRefs<TData[K]> | Ref<TData[K]>
    : TData[K] | Ref<TData[K]>;
};

export interface Config
  extends Omit<
      FetchOptions<unknown>,
      'baseURL' | 'body' | 'headers' | 'method' | 'query'
    >,
    WithRefs<Pick<FetchOptions<unknown>, 'query'>> {
  /**
   * **This feature works only with the [experimental parser](https://heyapi.dev/openapi-ts/configuration#parser)**
   *
   * Auth token or a function returning auth token. The resolved value will be
   * added to the request payload as defined by its `security` array.
   */
  auth?: ((auth: Auth) => Promise<AuthToken> | AuthToken) | AuthToken;
  /**
   * Base URL for all requests made by this client.
   *
   * @default ''
   */
  baseURL?: string;
  /**
   * A function for serializing request body parameter. By default,
   * {@link JSON.stringify()} will be used.
   */
  bodySerializer?: BodySerializer;
  /**
   * An object containing any HTTP headers that you want to pre-populate your
   * `Headers` object with.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/Headers/Headers#init See more}
   */
  headers?:
    | RequestInit['headers']
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
   * The request method.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#method See more}
   */
  method?:
    | 'CONNECT'
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'TRACE';
  /**
   * A function for serializing request query parameters. By default, arrays
   * will be exploded in form style, objects will be exploded in deepObject
   * style, and reserved characters are percent-encoded.
   *
   * {@link https://swagger.io/docs/specification/serialization/#query View examples}
   */
  querySerializer?: QuerySerializer | QuerySerializerOptions;
  /**
   * A function transforming response data before it's returned. This is useful
   * for post-processing data, e.g. converting ISO strings into Date objects.
   */
  responseTransformer?: (data: unknown) => Promise<unknown>;
  /**
   * **This feature works only with the [experimental parser](https://heyapi.dev/openapi-ts/configuration#parser)**
   *
   * A function validating response data. This is useful if you want to ensure
   * the response conforms to the desired shape, so it can be safely passed to
   * the transformers and returned to the user.
   */
  responseValidator?: (data: unknown) => Promise<unknown>;
}

export interface Auth {
  in?: 'header' | 'query';
  name?: string;
  scheme?: 'basic' | 'bearer';
  type: 'apiKey' | 'http';
}

type AuthToken = string | undefined;

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
      path?: Record<string, unknown>;
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

interface DataShape {
  body?: unknown;
  headers?: unknown;
  path?: Record<string, unknown>;
  query?: unknown;
  url: string;
}

export type BuildUrlOptions<
  TData extends Omit<DataShape, 'headers'> = Omit<DataShape, 'headers'>,
> = Pick<WithRefs<TData>, 'path' | 'query'> &
  Pick<TData, 'url'> &
  Pick<Options<'$fetch', TData>, 'baseURL' | 'querySerializer'>;

export interface Client {
  /**
   * Returns the final request URL. This method works only with experimental parser.
   */
  buildUrl: <TData extends Omit<DataShape, 'headers'>>(
    options: BuildUrlOptions<TData>,
  ) => string;
  connect: MethodFn;
  delete: MethodFn;
  get: MethodFn;
  getConfig: () => Config;
  head: MethodFn;
  options: MethodFn;
  patch: MethodFn;
  post: MethodFn;
  put: MethodFn;
  request: RequestFn;
  setConfig: (config: Config) => Config;
  trace: MethodFn;
}

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
