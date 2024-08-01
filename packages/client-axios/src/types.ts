import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
  CreateAxiosDefaults,
} from 'axios';

import type { BodySerializer } from './utils';

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface Config extends Omit<CreateAxiosDefaults, 'headers'> {
  /**
   * Axios implementation. You can use this option to provide a custom
   * Axios instance.
   * @default axios
   */
  axios?: AxiosStatic;
  /**
   * Any body that you want to add to your request.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
   */
  body?: unknown;
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
   * A function for transforming response data before it's returned to the
   * caller function. This is an ideal place to post-process server data,
   * e.g. convert date ISO strings into native Date objects.
   */
  responseTransformer?: (data: unknown) => Promise<unknown>;
  /**
   * Throw an error instead of returning it in the response?
   * @default false
   */
  throwOnError?: boolean;
}

interface RequestOptionsBase extends Config {
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  url: string;
}

export type RequestResult<Data = unknown, Error = unknown> = Promise<
  | (AxiosResponse<Data> & { error: never })
  | (AxiosError<Error> & { data: never; error: Error })
>;

type MethodFn = <Data = unknown, Error = unknown>(
  options: Omit<RequestOptionsBase, 'method'>,
) => RequestResult<Data, Error>;

type RequestFn = <Data = unknown, Error = unknown>(
  options: Omit<RequestOptionsBase, 'method'> &
    Pick<Required<RequestOptionsBase>, 'method'>,
) => RequestResult<Data, Error>;

export interface Client {
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

export type RequestOptions = RequestOptionsBase &
  Config & {
    headers: AxiosRequestConfig['headers'];
  };

type OptionsBase = Omit<RequestOptionsBase, 'url'> & {
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
};

export type Options<T = unknown> = T extends { body?: any }
  ? T extends { headers?: any }
    ? OmitKeys<OptionsBase, 'body' | 'headers' | 'responseTransformer'> & T
    : OmitKeys<OptionsBase, 'body' | 'responseTransformer'> &
        T &
        Pick<OptionsBase, 'headers'>
  : T extends { headers?: any }
    ? OmitKeys<OptionsBase, 'headers' | 'responseTransformer'> &
        T &
        Pick<OptionsBase, 'body'>
    : OptionsBase & T;
