import type { StringCase } from '../../../../types/case';
import type { Auth, AuthToken } from './auth';
import type {
  BodySerializer,
  QuerySerializer,
  QuerySerializerOptions,
} from './bodySerializer';

export type HttpMethod =
  | 'connect'
  | 'delete'
  | 'get'
  | 'head'
  | 'options'
  | 'patch'
  | 'post'
  | 'put'
  | 'trace';

export type Client<
  RequestFn = never,
  Config = unknown,
  MethodFn = never,
  BuildUrlFn = never,
  SseFn = never,
> = {
  /**
   * Returns the final request URL.
   */
  buildUrl: BuildUrlFn;
  getConfig: () => Config;
  request: RequestFn;
  setConfig: (config: Config) => Config;
} & {
  [K in HttpMethod]: MethodFn;
} & ([SseFn] extends [never]
    ? { sse?: never }
    : { sse: { [K in HttpMethod]: SseFn } });

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
   * The casing used by the generated client/types in the application code.
   * When provided, response payload keys will be converted to this case after
   * parsing. Defaults to 'camelCase' when a transform is applied.
   */
  clientCase?: StringCase;
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
  method?: Uppercase<HttpMethod>;
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
  /**
   * Runtime key casing for on-the-wire payloads. When set, request bodies and
   * query parameter keys will be converted from the generated/client case to
   * the specified case before sending; response payload keys will be converted
   * back after parsing. Path template names and enum/string literal values are
   * not transformed.
   *
   * This does not affect generated code; it only applies at runtime.
   *
   * @default 'preserve'
   */
  runtimeCase?: StringCase;
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
