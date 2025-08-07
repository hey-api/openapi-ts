import type { Auth, AuthToken } from './auth';
import type {
  BodySerializer,
  QuerySerializer,
  QuerySerializerOptions,
} from './bodySerializer';

export interface Client<
  RequestFn = never,
  Config = unknown,
  MethodFn = never,
  BuildUrlFn = never,
> {
  /**
   * Returns the final request URL.
   */
  buildUrl: BuildUrlFn;
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

export interface Config {
  /**
   * Auth token or a function returning auth token. The resolved value will be
   * added to the request payload as defined by its `security` array.
   */
  auth?: ((auth: Auth) => Promise<AuthToken> | AuthToken) | AuthToken;
  /**
   * A function for serializing request body parameter. By default,
   * {@link JSON.stringify()} will be used.
   */
  bodySerializer?: BodySerializer | null;
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
   * This method will have no effect if the native `paramsSerializer()` Axios
   * API function is used.
   *
   * {@link https://swagger.io/docs/specification/serialization/#query View examples}
   */
  querySerializer?: QuerySerializer | QuerySerializerOptions;
  /**
   * A function validating request data. This is useful if you want to ensure
   * the request conforms to the desired shape, so it can be safely sent to
   * the server.
   */
  requestValidator?: (data: unknown) => Promise<unknown>;
  /**
   * A function transforming response data before it's returned. This is useful
   * for post-processing data, e.g. converting ISO strings into Date objects.
   */
  responseTransformer?: (data: unknown) => Promise<unknown>;
  /**
   * A function validating response data. This is useful if you want to ensure
   * the response conforms to the desired shape, so it can be safely passed to
   * the transformers and returned to the user.
   */
  responseValidator?: (data: unknown) => Promise<unknown>;
}

type IsExactlyNeverOrNeverUndefined<T> = [T] extends [never]
  ? true
  : [T] extends [never | undefined]
    ? [undefined] extends [T]
      ? false
      : true
    : false;

export type OmitNever<T extends Record<string, unknown>> = {
  [K in keyof T as IsExactlyNeverOrNeverUndefined<T[K]> extends true
    ? never
    : K]: T[K];
};
n>
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
  options: Omit<RequestOptions<TResponseStyle, ThrowOnError>, 'method'>,
) => RequestResult<TData, TError, ThrowOnError, TResponseStyle>;

type RequestFn = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
  TResponseStyle extends ResponseStyle = 'fields',
>(
  options: Omit<RequestOptions<TResponseStyle, ThrowOnError>, 'method'> &
    Pick<Required<RequestOptions<TResponseStyle, ThrowOnError>>, 'method'>,
) => RequestResult<TData, TError, ThrowOnError, TResponseStyle>;

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

export type Client = CoreClient<RequestFn, Config, MethodFn, BuildUrlFn> & {
  interceptors: Middleware<Request, Response, unknown, RequestOptions>;
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
  TResponseStyle extends ResponseStyle = 'fields',
> = OmitKeys<
  RequestOptions<TResponseStyle, ThrowOnError>,
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
        RequestOptions<TResponseStyle, ThrowOnError>,
        'body' | 'headers' | 'url'
      > &
        TData
    : OmitKeys<RequestOptions<TResponseStyle, ThrowOnError>, 'body' | 'url'> &
        TData &
        Pick<RequestOptions<TResponseStyle, ThrowOnError>, 'headers'>
  : TData extends { headers?: any }
    ? OmitKeys<
        RequestOptions<TResponseStyle, ThrowOnError>,
        'headers' | 'url'
      > &
        TData &
        Pick<RequestOptions<TResponseStyle, ThrowOnError>, 'body'>
    : OmitKeys<RequestOptions<TResponseStyle, ThrowOnError>, 'url'> & TData;
