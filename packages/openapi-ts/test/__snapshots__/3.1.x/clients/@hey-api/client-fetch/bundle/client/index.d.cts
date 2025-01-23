interface Auth {
    in?: 'header' | 'query';
    name?: string;
    scheme?: 'basic' | 'bearer';
    type: 'apiKey' | 'http';
}
interface SerializerOptions<T> {
    /**
     * @default true
     */
    explode: boolean;
    style: T;
}
type ArrayStyle = 'form' | 'spaceDelimited' | 'pipeDelimited';
type ObjectStyle = 'form' | 'deepObject';

type BodySerializer = (body: any) => any;
type QuerySerializer = (query: Record<string, unknown>) => string;
interface QuerySerializerOptions {
    allowReserved?: boolean;
    array?: SerializerOptions<ArrayStyle>;
    object?: SerializerOptions<ObjectStyle>;
}
declare const formDataBodySerializer: {
    bodySerializer: <T>(body: T) => FormData;
};
declare const jsonBodySerializer: {
    bodySerializer: <T>(body: T) => string;
};
declare const urlSearchParamsBodySerializer: {
    bodySerializer: <T extends Record<string, any> | Array<Record<string, any>>>(body: T) => URLSearchParams;
};

type ErrInterceptor<Err, Res, Req, Options> = (error: Err, response: Res, request: Req, options: Options) => Err | Promise<Err>;
type ReqInterceptor<Req, Options> = (request: Req, options: Options) => Req | Promise<Req>;
type ResInterceptor<Res, Req, Options> = (response: Res, request: Req, options: Options) => Res | Promise<Res>;
declare class Interceptors<Interceptor> {
    _fns: Interceptor[];
    constructor();
    clear(): void;
    exists(fn: Interceptor): boolean;
    eject(fn: Interceptor): void;
    use(fn: Interceptor): void;
}
interface Middleware<Req, Res, Err, Options> {
    error: Pick<Interceptors<ErrInterceptor<Err, Res, Req, Options>>, 'eject' | 'use'>;
    request: Pick<Interceptors<ReqInterceptor<Req, Options>>, 'eject' | 'use'>;
    response: Pick<Interceptors<ResInterceptor<Res, Req, Options>>, 'eject' | 'use'>;
}
declare const createConfig: (override?: Config) => Config;

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;
interface Config<ThrowOnError extends boolean = boolean> extends Omit<RequestInit, 'body' | 'headers' | 'method'> {
    /**
     * Auth token or a function returning auth token. The resolved value will be
     * added to the request payload as defined by its `security` array.
     */
    auth?: ((auth: Auth) => Promise<AuthToken> | AuthToken) | AuthToken;
    /**
     * Base URL for all requests made by this client.
     *
     * @default ''
     */
    baseUrl?: string;
    /**
     * A function for serializing request body parameter. By default,
     * {@link JSON.stringify()} will be used.
     */
    bodySerializer?: BodySerializer | null;
    /**
     * Fetch API implementation. You can use this option to provide a custom
     * fetch instance.
     *
     * @default globalThis.fetch
     */
    fetch?: (request: Request) => ReturnType<typeof fetch>;
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
     * Return the response data parsed in a specified format. By default, `auto`
     * will infer the appropriate method from the `Content-Type` response header.
     * You can override this behavior with any of the {@link Body} methods.
     * Select `stream` if you don't want to parse response data at all.
     *
     * @default 'auto'
     */
    parseAs?: Exclude<keyof Body, 'body' | 'bodyUsed'> | 'auto' | 'stream';
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
type AuthToken = string | undefined;
interface RequestOptions<ThrowOnError extends boolean = boolean, Url extends string = string> extends Config<ThrowOnError> {
    /**
     * Any body that you want to add to your request.
     *
     * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
     */
    body?: RequestInit['body'] | Record<string, unknown> | Array<Record<string, unknown>> | Array<unknown> | number;
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
    security?: ReadonlyArray<Auth>;
    url: Url;
}
type RequestResult<TData = unknown, TError = unknown, ThrowOnError extends boolean = boolean> = ThrowOnError extends true ? Promise<{
    data: TData;
    request: Request;
    response: Response;
}> : Promise<({
    data: TData;
    error: undefined;
} | {
    data: undefined;
    error: TError;
}) & {
    request: Request;
    response: Response;
}>;
type MethodFn = <TData = unknown, TError = unknown, ThrowOnError extends boolean = false>(options: Omit<RequestOptions<ThrowOnError>, 'method'>) => RequestResult<TData, TError, ThrowOnError>;
type RequestFn = <TData = unknown, TError = unknown, ThrowOnError extends boolean = false>(options: Omit<RequestOptions<ThrowOnError>, 'method'> & Pick<Required<RequestOptions<ThrowOnError>>, 'method'>) => RequestResult<TData, TError, ThrowOnError>;
interface Client<Req = Request, Res = Response, Err = unknown, Opts = RequestOptions> {
    /**
     * Returns the final request URL. This method works only with experimental parser.
     */
    buildUrl: <TData extends {
        body?: unknown;
        path?: Record<string, unknown>;
        query?: Record<string, unknown>;
        url: string;
    }>(options: Pick<TData, 'url'> & Options<TData>) => string;
    connect: MethodFn;
    delete: MethodFn;
    get: MethodFn;
    getConfig: () => Config;
    head: MethodFn;
    interceptors: Middleware<Req, Res, Err, Opts>;
    options: MethodFn;
    patch: MethodFn;
    post: MethodFn;
    put: MethodFn;
    request: RequestFn;
    setConfig: (config: Config) => Config;
    trace: MethodFn;
}
interface DataShape {
    body?: unknown;
    headers?: unknown;
    path?: unknown;
    query?: unknown;
    url: string;
}
type Options<TData extends DataShape = DataShape, ThrowOnError extends boolean = boolean> = OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'path' | 'query' | 'url'> & Omit<TData, 'url'>;
type OptionsLegacyParser<TData = unknown, ThrowOnError extends boolean = boolean> = TData extends {
    body?: any;
} ? TData extends {
    headers?: any;
} ? OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'headers' | 'url'> & TData : OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'url'> & TData & Pick<RequestOptions<ThrowOnError>, 'headers'> : TData extends {
    headers?: any;
} ? OmitKeys<RequestOptions<ThrowOnError>, 'headers' | 'url'> & TData & Pick<RequestOptions<ThrowOnError>, 'body'> : OmitKeys<RequestOptions<ThrowOnError>, 'url'> & TData;

declare const createClient: (config?: Config) => Client;

export { type Auth, type Client, type Config, type Options, type OptionsLegacyParser, type QuerySerializerOptions, type RequestOptions, type RequestResult, createClient, createConfig, formDataBodySerializer, jsonBodySerializer, urlSearchParamsBodySerializer };
