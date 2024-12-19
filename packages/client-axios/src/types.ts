import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosStatic,
  CreateAxiosDefaults,
} from 'axios';

import type {
  BodySerializer,
  QuerySerializer,
  QuerySerializerOptions,
} from './utils';

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface Config<ThrowOnError extends boolean = boolean>
  extends Omit<CreateAxiosDefaults, 'headers'> {
  /**
   * **This feature works only with the [experimental parser](https://heyapi.dev/openapi-ts/configuration#parser)**
   *
   * Access token or a function returning access token. The resolved token will
   * be added to request payload as required.
   */
  accessToken?: (() => Promise<string | undefined>) | string | undefined;
  /**
   * **This feature works only with the [experimental parser](https://heyapi.dev/openapi-ts/configuration#parser)**
   *
   * API key or a function returning API key. The resolved key will be added
   * to the request payload as required.
   */
  apiKey?: (() => Promise<string | undefined>) | string | undefined;
  /**
   * Axios implementation. You can use this option to provide a custom
   * Axios instance.
   *
   * @default axios
   */
  axios?: AxiosStatic;
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
    | CreateAxiosDefaults['headers']
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
    | 'connect'
    | 'delete'
    | 'get'
    | 'head'
    | 'options'
    | 'patch'
    | 'post'
    | 'put'
    | 'trace';
  /**
   * A function for serializing request query parameters. By default, arrays
   * will be exploded in form style, objects will be exploded in deepObject
   * style, and reserved characters are percent-encoded.
   *
   * This method will have no effect if the native `paramsSerializer()` Axios
   * API function is used.
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
  /**
   * Throw an error instead of returning it in the response?
   *
   * @default false
   */
  throwOnError?: ThrowOnError;
}

export interface RequestOptions<
  ThrowOnError extends boolean = boolean,
  Url extends string = string,
> extends Config<ThrowOnError> {
  /**
   * Any body that you want to add to your request.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
   */
  body?: unknown;
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  /**
   * Security mechanism(s) to use for the request.
   */
  security?: ReadonlyArray<Security>;
  url: Url;
}

export type RequestResult<
  Data = unknown,
  TError = unknown,
  ThrowOnError extends boolean = boolean,
> = ThrowOnError extends true
  ? Promise<AxiosResponse<Data>>
  : Promise<
      | (AxiosResponse<Data> & { error: undefined })
      | (AxiosError<TError> & { data: undefined; error: TError })
    >;

export interface Security {
  fn: 'accessToken' | 'apiKey';
  in: 'header' | 'query';
  name: string;
}

type MethodFn = <
  Data = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
>(
  options: Omit<RequestOptions<ThrowOnError>, 'method'>,
) => RequestResult<Data, TError, ThrowOnError>;

type RequestFn = <
  Data = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
>(
  options: Omit<RequestOptions<ThrowOnError>, 'method'> &
    Pick<Required<RequestOptions<ThrowOnError>>, 'method'>,
) => RequestResult<Data, TError, ThrowOnError>;

export interface Client {
  /**
   * Returns the final request URL. This method works only with experimental parser.
   */
  buildUrl: <
    Data extends {
      body?: unknown;
      path?: Record<string, unknown>;
      query?: Record<string, unknown>;
      url: string;
    },
  >(
    options: Pick<Data, 'url'> & Omit<Options<Data>, 'axios'>,
  ) => string;
  delete: MethodFn;
  get: MethodFn;
  getConfig: () => Config;
  head: MethodFn;
  instance: AxiosInstance;
  options: MethodFn;
  patch: MethodFn;
  post: MethodFn;
  put: MethodFn;
  request: RequestFn;
  setConfig: (config: Config) => Config;
}

interface DataShape {
  body?: unknown;
  headers?: unknown;
  path?: unknown;
  query?: unknown;
  url: string;
}

export type Options<
  Data extends DataShape = DataShape,
  ThrowOnError extends boolean = boolean,
> = OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'path' | 'query' | 'url'> &
  Omit<Data, 'url'>;

export type OptionsLegacyParser<
  Data = unknown,
  ThrowOnError extends boolean = boolean,
> = Data extends { body?: any }
  ? Data extends { headers?: any }
    ? OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'headers' | 'url'> & Data
    : OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'url'> &
        Data &
        Pick<RequestOptions<ThrowOnError>, 'headers'>
  : Data extends { headers?: any }
    ? OmitKeys<RequestOptions<ThrowOnError>, 'headers' | 'url'> &
        Data &
        Pick<RequestOptions<ThrowOnError>, 'body'>
    : OmitKeys<RequestOptions<ThrowOnError>, 'url'> & Data;
