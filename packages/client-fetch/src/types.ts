import type { ApiRequestOptions } from '@hey-api/client-core';

import type {
  BodySerializer,
  FetchOptions,
  QuerySerializer,
  QuerySerializerOptions,
} from './utils';

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
