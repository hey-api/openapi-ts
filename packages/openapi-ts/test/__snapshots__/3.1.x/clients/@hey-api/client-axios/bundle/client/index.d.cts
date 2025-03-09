import { CreateAxiosDefaults, AxiosStatic, AxiosResponse, AxiosError, AxiosInstance } from 'axios';

type AuthToken = string | undefined;
interface Auth {
    /**
     * Which part of the request do we use to send the auth?
     *
     * @default 'header'
     */
    in?: 'header' | 'query';
    /**
     * Header or query parameter name.
     *
     * @default 'Authorization'
     */
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

type QuerySerializer = (query: Record<string, unknown>) => string;
type BodySerializer = (body: any) => any;
interface QuerySerializerOptions {
    allowReserved?: boolean;
    array?: SerializerOptions<ArrayStyle>;
    object?: SerializerOptions<ObjectStyle>;
}
declare const formDataBodySerializer: {
    bodySerializer: <T extends Record<string, any> | Array<Record<string, any>>>(body: T) => FormData;
};
declare const jsonBodySerializer: {
    bodySerializer: <T>(body: T) => string;
};
declare const urlSearchParamsBodySerializer: {
    bodySerializer: <T extends Record<string, any> | Array<Record<string, any>>>(body: T) => string;
};

interface Client$1<RequestFn = never, Config = unknown, MethodFn = never, BuildUrlFn = never> {
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

interface Config<T extends ClientOptions = ClientOptions> extends Omit<CreateAxiosDefaults, 'auth' | 'baseURL' | 'headers' | 'method'>, Config$1 {
    /**
     * Axios implementation. You can use this option to provide a custom
     * Axios instance.
     *
     * @default axios
     */
    axios?: AxiosStatic;
    /**
     * Base URL for all requests made by this client.
     */
    baseURL?: T['baseURL'];
    /**
     * An object containing any HTTP headers that you want to pre-populate your
     * `Headers` object with.
     *
     * {@link https://developer.mozilla.org/docs/Web/API/Headers/Headers#init See more}
     */
    headers?: CreateAxiosDefaults['headers'] | Record<string, string | number | boolean | (string | number | boolean)[] | null | undefined | unknown>;
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: T['throwOnError'];
}
interface RequestOptions<ThrowOnError extends boolean = boolean, Url extends string = string> extends Config<{
    throwOnError: ThrowOnError;
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
type RequestResult<TData = unknown, TError = unknown, ThrowOnError extends boolean = boolean> = ThrowOnError extends true ? Promise<AxiosResponse<TData>> : Promise<(AxiosResponse<TData> & {
    error: undefined;
}) | (AxiosError<TError> & {
    data: undefined;
    error: TError;
})>;
interface ClientOptions {
    baseURL?: string;
    throwOnError?: boolean;
}
type MethodFn = <TData = unknown, TError = unknown, ThrowOnError extends boolean = false>(options: Omit<RequestOptions<ThrowOnError>, 'method'>) => RequestResult<TData, TError, ThrowOnError>;
type RequestFn = <TData = unknown, TError = unknown, ThrowOnError extends boolean = false>(options: Omit<RequestOptions<ThrowOnError>, 'method'> & Pick<Required<RequestOptions<ThrowOnError>>, 'method'>) => RequestResult<TData, TError, ThrowOnError>;
type BuildUrlFn = <TData extends {
    body?: unknown;
    path?: Record<string, unknown>;
    query?: Record<string, unknown>;
    url: string;
}>(options: Pick<TData, 'url'> & Omit<Options<TData>, 'axios'>) => string;
type Client = Client$1<RequestFn, Config, MethodFn, BuildUrlFn> & {
    instance: AxiosInstance;
};
/**
 * The `createClientConfig()` function will be called on client initialization
 * and the returned object will become the client's initial configuration.
 *
 * You may want to initialize your client this way instead of calling
 * `setConfig()`. This is useful for example if you're using Next.js
 * to ensure your client always has the correct values.
 */
type CreateClientConfig<T extends ClientOptions = ClientOptions> = (override?: Config<ClientOptions & T>) => Config<Required<ClientOptions> & T>;
interface TDataShape {
    body?: unknown;
    headers?: unknown;
    path?: unknown;
    query?: unknown;
    url: string;
}
type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;
type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'path' | 'query' | 'url'> & Omit<TData, 'url'>;
type OptionsLegacyParser<TData = unknown, ThrowOnError extends boolean = boolean> = TData extends {
    body?: any;
} ? TData extends {
    headers?: any;
} ? OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'headers' | 'url'> & TData : OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'url'> & TData & Pick<RequestOptions<ThrowOnError>, 'headers'> : TData extends {
    headers?: any;
} ? OmitKeys<RequestOptions<ThrowOnError>, 'headers' | 'url'> & TData & Pick<RequestOptions<ThrowOnError>, 'body'> : OmitKeys<RequestOptions<ThrowOnError>, 'url'> & TData;

declare const createClient: (config?: Config) => Client;

declare const createConfig: <T extends ClientOptions = ClientOptions>(override?: Config<Omit<ClientOptions, keyof T> & T>) => Config<Omit<ClientOptions, keyof T> & T>;

export { type Auth, type Client, type ClientOptions, type Config, type CreateClientConfig, type Options, type OptionsLegacyParser, type QuerySerializerOptions, type RequestOptions, type RequestResult, type TDataShape, createClient, createConfig, formDataBodySerializer, jsonBodySerializer, urlSearchParamsBodySerializer };
