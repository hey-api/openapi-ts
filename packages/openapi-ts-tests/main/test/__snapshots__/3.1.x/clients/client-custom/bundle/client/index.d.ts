//#region src/core/auth.d.ts
type AuthToken = string | undefined;
interface Auth {
  /**
   * Which part of the request do we use to send the auth?
   *
   * @default 'header'
   */
  in?: 'header' | 'query' | 'cookie';
  /**
   * Header or query parameter name.
   *
   * @default 'Authorization'
   */
  name?: string;
  scheme?: 'basic' | 'bearer';
  type: 'apiKey' | 'http';
}
//#endregion
//#region src/core/pathSerializer.d.ts
interface SerializerOptions<T$1> {
  /**
   * @default true
   */
  explode: boolean;
  style: T$1;
}
type ArrayStyle = 'form' | 'spaceDelimited' | 'pipeDelimited';
type ObjectStyle = 'form' | 'deepObject';
//#endregion
//#region src/core/bodySerializer.d.ts
type QuerySerializer = (query: Record<string, unknown>) => string;
type BodySerializer = (body: any) => any;
type QuerySerializerOptionsObject = {
  allowReserved?: boolean;
  array?: Partial<SerializerOptions<ArrayStyle>>;
  object?: Partial<SerializerOptions<ObjectStyle>>;
};
type QuerySerializerOptions = QuerySerializerOptionsObject & {
  /**
   * Per-parameter serialization overrides. When provided, these settings
   * override the global array/object settings for specific parameter names.
   */
  parameters?: Record<string, QuerySerializerOptionsObject>;
};
declare const formDataBodySerializer: {
  bodySerializer: <T extends Record<string, any> | Array<Record<string, any>>>(body: T) => FormData;
};
declare const jsonBodySerializer: {
  bodySerializer: <T>(body: T) => string;
};
declare const urlSearchParamsBodySerializer: {
  bodySerializer: <T extends Record<string, any> | Array<Record<string, any>>>(body: T) => string;
};
//#endregion
//#region src/core/types.d.ts
interface Client$1<RequestFn$1 = never, Config$2 = unknown, MethodFn$1 = never, BuildUrlFn$1 = never> {
  /**
   * Returns the final request URL.
   */
  buildUrl: BuildUrlFn$1;
  connect: MethodFn$1;
  delete: MethodFn$1;
  get: MethodFn$1;
  getConfig: () => Config$2;
  head: MethodFn$1;
  options: MethodFn$1;
  patch: MethodFn$1;
  post: MethodFn$1;
  put: MethodFn$1;
  request: RequestFn$1;
  setConfig: (config: Config$2) => Config$2;
  trace: MethodFn$1;
}
interface Config$1 {
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
  headers?: RequestInit['headers'] | Record<string, string | number | boolean | (string | number | boolean)[] | null | undefined | unknown>;
  /**
   * The request method.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#method See more}
   */
  method?: 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';
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
//#endregion
//#region src/utils.d.ts
type ErrInterceptor<Err$1, Res$1, Req$1, Options$2> = (error: Err$1, response: Res$1, request: Req$1, options: Options$2) => Err$1 | Promise<Err$1>;
type ReqInterceptor<Req$1, Options$2> = (request: Req$1, options: Options$2) => Req$1 | Promise<Req$1>;
type ResInterceptor<Res$1, Req$1, Options$2> = (response: Res$1, request: Req$1, options: Options$2) => Res$1 | Promise<Res$1>;
declare class Interceptors<Interceptor> {
  fns: Array<Interceptor | null>;
  clear(): void;
  eject(id: number | Interceptor): void;
  exists(id: number | Interceptor): boolean;
  getInterceptorIndex(id: number | Interceptor): number;
  update(id: number | Interceptor, fn: Interceptor): number | Interceptor | false;
  use(fn: Interceptor): number;
}
interface Middleware<Req$1, Res$1, Err$1, Options$2> {
  error: Interceptors<ErrInterceptor<Err$1, Res$1, Req$1, Options$2>>;
  request: Interceptors<ReqInterceptor<Req$1, Options$2>>;
  response: Interceptors<ResInterceptor<Res$1, Req$1, Options$2>>;
}
declare const createConfig: <T extends ClientOptions = ClientOptions>(override?: Config<Omit<ClientOptions, keyof T> & T>) => Config<Omit<ClientOptions, keyof T> & T>;
//#endregion
//#region src/types.d.ts
interface Config<T$1 extends ClientOptions = ClientOptions> extends Omit<RequestInit, 'body' | 'headers' | 'method'>, Config$1 {
  /**
   * Base URL for all requests made by this client.
   */
  baseUrl?: T$1['baseUrl'];
  /**
   * Fetch API implementation. You can use this option to provide a custom
   * fetch instance.
   *
   * @default globalThis.fetch
   */
  fetch?: (request: Request) => ReturnType<typeof fetch>;
  /**
   * Return the response data parsed in a specified format. By default, `auto`
   * will infer the appropriate method from the `Content-Type` response header.
   * You can override this behavior with any of the {@link Body} methods.
   * Select `stream` if you don't want to parse response data at all.
   *
   * @default 'auto'
   */
  parseAs?: 'arrayBuffer' | 'auto' | 'blob' | 'formData' | 'json' | 'stream' | 'text';
  /**
   * Throw an error instead of returning it in the response?
   *
   * @default false
   */
  throwOnError?: T$1['throwOnError'];
}
interface RequestOptions<ThrowOnError$1 extends boolean = boolean, Url extends string = string> extends Config<{
  throwOnError: ThrowOnError$1;
}> {
  /**
   * Any body that you want to add to your request.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
   */
  body?: unknown;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  /**
   * Security mechanism(s) to use for the request.
   */
  security?: ReadonlyArray<Auth>;
  url: Url;
}
type RequestResult<TData$1 = unknown, TError$1 = unknown, ThrowOnError$1 extends boolean = boolean> = ThrowOnError$1 extends true ? Promise<{
  data: TData$1;
  request: Request;
  response: Response;
}> : Promise<({
  data: TData$1;
  error: undefined;
} | {
  data: undefined;
  error: TError$1;
}) & {
  request: Request;
  response: Response;
}>;
interface ClientOptions {
  baseUrl?: string;
  throwOnError?: boolean;
}
type MethodFn = <TData = unknown, TError = unknown, ThrowOnError extends boolean = false>(options: Omit<RequestOptions<ThrowOnError>, 'method'>) => RequestResult<TData, TError, ThrowOnError>;
type RequestFn = <TData = unknown, TError = unknown, ThrowOnError extends boolean = false>(options: Omit<RequestOptions<ThrowOnError>, 'method'> & Pick<Required<RequestOptions<ThrowOnError>>, 'method'>) => RequestResult<TData, TError, ThrowOnError>;
type BuildUrlFn = <TData extends {
  body?: unknown;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  url: string;
}>(options: Pick<TData, 'url'> & Options$1<TData>) => string;
type Client = Client$1<RequestFn, Config, MethodFn, BuildUrlFn> & {
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
type CreateClientConfig<T$1 extends ClientOptions = ClientOptions> = (override?: Config<ClientOptions & T$1>) => Config<Required<ClientOptions> & T$1>;
interface TDataShape {
  body?: unknown;
  headers?: unknown;
  path?: unknown;
  query?: unknown;
  url: string;
}
type OmitKeys<T$1, K$1> = Pick<T$1, Exclude<keyof T$1, K$1>>;
type Options$1<TData$1 extends TDataShape = TDataShape, ThrowOnError$1 extends boolean = boolean> = OmitKeys<RequestOptions<ThrowOnError$1>, 'body' | 'path' | 'query' | 'url'> & Omit<TData$1, 'url'>;
type OptionsLegacyParser<TData$1 = unknown, ThrowOnError$1 extends boolean = boolean> = TData$1 extends {
  body?: any;
} ? TData$1 extends {
  headers?: any;
} ? OmitKeys<RequestOptions<ThrowOnError$1>, 'body' | 'headers' | 'url'> & TData$1 : OmitKeys<RequestOptions<ThrowOnError$1>, 'body' | 'url'> & TData$1 & Pick<RequestOptions<ThrowOnError$1>, 'headers'> : TData$1 extends {
  headers?: any;
} ? OmitKeys<RequestOptions<ThrowOnError$1>, 'headers' | 'url'> & TData$1 & Pick<RequestOptions<ThrowOnError$1>, 'body'> : OmitKeys<RequestOptions<ThrowOnError$1>, 'url'> & TData$1;
//#endregion
//#region src/client.d.ts
declare const createClient: (config?: Config) => Client;
//#endregion
//#region src/core/params.d.ts
type Slot = 'body' | 'headers' | 'path' | 'query';
type Field = {
  in: Exclude<Slot, 'body'>;
  key: string;
  map?: string;
} | {
  in: Extract<Slot, 'body'>;
  key?: string;
  map?: string;
};
interface Fields {
  allowExtra?: Partial<Record<Slot, boolean>>;
  args?: ReadonlyArray<Field>;
}
type FieldsConfig = ReadonlyArray<Field | Fields>;
interface Params {
  body: unknown;
  headers: Record<string, unknown>;
  path: Record<string, unknown>;
  query: Record<string, unknown>;
}
declare const buildClientParams: (args: ReadonlyArray<unknown>, fields: FieldsConfig) => Params;
//# sourceMappingURL=index.d.ts.map

export { type Auth, type Client, type ClientOptions, type Config, type CreateClientConfig, type Options$1 as Options, type OptionsLegacyParser, type QuerySerializerOptions, type RequestOptions, type RequestResult, type TDataShape, buildClientParams, createClient, createConfig, formDataBodySerializer, jsonBodySerializer, urlSearchParamsBodySerializer };
