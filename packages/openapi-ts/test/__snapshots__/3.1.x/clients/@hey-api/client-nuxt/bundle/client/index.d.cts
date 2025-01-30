import { AsyncDataOptions, useAsyncData, useFetch, useLazyAsyncData, useLazyFetch, UseFetchOptions } from 'nuxt/app';
import { Ref } from 'vue';

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

type QuerySerializer$1 = (query: Record<string, unknown>) => string;
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
    bodySerializer: <T extends Record<string, any> | Array<Record<string, any>>>(body: T) => URLSearchParams;
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
    querySerializer?: QuerySerializer$1 | QuerySerializerOptions;
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

type QuerySerializer = (query: Parameters<Client['buildUrl']>[0]['query']) => string;
type WithRefs<TData> = {
    [K in keyof TData]: NonNullable<TData[K]> extends object ? WithRefs<NonNullable<TData[K]>> | Ref<NonNullable<TData[K]>> : NonNullable<TData[K]> | Ref<NonNullable<TData[K]>>;
};
interface Config extends Omit<FetchOptions<unknown>, 'baseURL' | 'body' | 'headers' | 'method' | 'query'>, WithRefs<Pick<FetchOptions<unknown>, 'query'>>, Omit<Config$1, 'querySerializer'> {
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
interface RequestOptions<TComposable extends Composable = Composable, Url extends string = string> extends Config, WithRefs<{
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
    composable: TComposable;
    key?: string;
    /**
     * Security mechanism(s) to use for the request.
     */
    security?: ReadonlyArray<Auth>;
    url: Url;
}
type RequestResult<TComposable extends Composable, TData, TError> = TComposable extends '$fetch' ? ReturnType<typeof $fetch<TData>> : TComposable extends 'useAsyncData' ? ReturnType<typeof useAsyncData<TData | null, TError>> : TComposable extends 'useFetch' ? ReturnType<typeof useFetch<TData | null, TError>> : TComposable extends 'useLazyAsyncData' ? ReturnType<typeof useLazyAsyncData<TData | null, TError>> : TComposable extends 'useLazyFetch' ? ReturnType<typeof useLazyFetch<TData | null, TError>> : never;
type MethodFn = <TComposable extends Composable, TData = unknown, TError = unknown>(options: Omit<RequestOptions<TComposable>, 'method'>) => RequestResult<TComposable, TData, TError>;
type RequestFn = <TComposable extends Composable, TData = unknown, TError = unknown>(options: Omit<RequestOptions<TComposable>, 'method'> & Pick<Required<RequestOptions<TComposable>>, 'method'>) => RequestResult<TComposable, TData, TError>;
/**
 * The `createClientConfig()` function will be called on client initialization
 * and the returned object will become the client's initial configuration.
 *
 * You may want to initialize your client this way instead of calling
 * `setConfig()`. This is useful for example if you're using Next.js
 * to ensure your client always has the correct values.
 */
type CreateClientConfig = (override?: Config) => Config;
interface TDataShape {
    body?: unknown;
    headers?: unknown;
    path?: FetchOptions<unknown>['query'];
    query?: FetchOptions<unknown>['query'];
    url: string;
}
type BuildUrlOptions<TData extends Omit<TDataShape, 'headers'> = Omit<TDataShape, 'headers'>> = Pick<WithRefs<TData>, 'path' | 'query'> & Pick<TData, 'url'> & Pick<Options<'$fetch', TData>, 'baseURL' | 'querySerializer'>;
type BuildUrlFn = <TData extends Omit<TDataShape, 'headers'>>(options: BuildUrlOptions<TData>) => string;
type Client = Client$1<RequestFn, Config, MethodFn, BuildUrlFn>;
type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;
type Options<TComposable extends Composable, TData extends TDataShape = TDataShape> = OmitKeys<RequestOptions<TComposable>, 'body' | 'path' | 'query' | 'url'> & WithRefs<Omit<TData, 'url'>>;
type OptionsLegacyParser<TData = unknown> = TData extends {
    body?: any;
} ? TData extends {
    headers?: any;
} ? OmitKeys<RequestOptions, 'body' | 'headers' | 'url'> & TData : OmitKeys<RequestOptions, 'body' | 'url'> & TData & Pick<RequestOptions, 'headers'> : TData extends {
    headers?: any;
} ? OmitKeys<RequestOptions, 'headers' | 'url'> & TData & Pick<RequestOptions, 'body'> : OmitKeys<RequestOptions, 'url'> & TData;
type FetchOptions<TData> = Omit<UseFetchOptions<TData, TData>, keyof AsyncDataOptions<TData>>;
type Composable = '$fetch' | 'useAsyncData' | 'useFetch' | 'useLazyAsyncData' | 'useLazyFetch';

declare const createClient: (config?: Config) => Client;

declare const createConfig: CreateClientConfig;

export { type Auth, type Client, type Composable, type Config, type CreateClientConfig, type Options, type OptionsLegacyParser, type QuerySerializerOptions, type RequestOptions, type RequestResult, type TDataShape, createClient, createConfig, formDataBodySerializer, jsonBodySerializer, urlSearchParamsBodySerializer };
