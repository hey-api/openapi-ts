import type {
  BodySerializer,
  FetchOptions,
  QuerySerializer,
  QuerySerializerOptions,
} from './utils';

type ApiRequestOptions = {
  readonly body?: any;
  readonly cookies?: Record<string, unknown>;
  readonly errors?: Record<number, string>;
  readonly formData?: Record<string, unknown>;
  readonly headers?: Record<string, unknown>;
  readonly mediaType?: string;
  readonly method:
    | 'CONNECT'
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'TRACE';
  readonly path?: Record<string, unknown>;
  readonly query?: Record<string, unknown>;
  readonly responseHeader?: string;
  readonly url: string;
};

interface FetchConfig extends FetchOptions {
  /**
   * custom fetch
   * @default globalThis.fetch
   */
  fetch: (request: Request) => ReturnType<typeof fetch>;
}

interface BodyType<T = unknown> {
  arrayBuffer: Awaited<ReturnType<Response['arrayBuffer']>>;
  blob: Awaited<ReturnType<Response['blob']>>;
  json: T;
  stream: Response['body'];
  text: Awaited<ReturnType<Response['text']>>;
}

interface RequestResponse<Data = unknown, Error = unknown> {
  error?: Error;
  data?: Data;
  request: Request;
  response: Response;
}

export type RequestResult<Data = unknown, Error = unknown> = Promise<
  RequestResponse<Data, Error>
>;

export interface Config extends FetchConfig {
  /**
   * Base URL...
   * @default ''
   */
  baseUrl: string;
  /**
   * Body serializer...
   */
  bodySerializer: BodySerializer<unknown>;
  /**
   * Global??
   * @default true
   */
  global: boolean;
  /**
   * Parse as...
   * @default 'json'
   */
  parseAs: keyof BodyType;
  /**
   * Query serializer...
   */
  querySerializer: QuerySerializer<unknown> | QuerySerializerOptions;
}

export interface Req
  extends Omit<ApiRequestOptions, 'headers'>,
    Omit<Partial<Config>, 'body' | 'method'> {}

export type Options<T = unknown> = Omit<Req, 'method' | 'url'> & T;
