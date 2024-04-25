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
   * Query serializer...
   */
  querySerializer: QuerySerializer<unknown> | QuerySerializerOptions;
}

export interface Req
  extends Omit<ApiRequestOptions, 'body' | 'headers'>,
    Omit<Partial<Config>, 'method'> {}
