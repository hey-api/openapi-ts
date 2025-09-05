import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  CreateAxiosDefaults,
} from 'axios';

import type { Auth } from '../../client-core/bundle/auth';
import type { Config as CoreConfig } from '../../client-core/bundle/types';

/**
 * Configuration interface for NestJS modules
 */
export interface ClientModuleConfig {
  /**
   * Custom axios configuration options
   */
  axiosConfig?: AxiosRequestConfig;

  /**
   * Base URL for API requests
   */
  baseUrl?: string;

  /**
   * Default headers to include with requests
   */
  headers?: Record<string, string>;
}
export const ClientModuleConfig = Symbol('ClientModuleConfig');

/**
 * Async configuration for NestJS modules using factory pattern
 */
export interface ClientModuleAsyncConfig {
  /**
   * Modules to import for dependency injection
   */
  imports?: ModuleMetadata['imports'];

  /**
   * Dependencies to inject into the factory function
   */
  inject?: FactoryProvider['inject'];

  /**
   * Configuration class to use
   */
  useClass?: (...args: any[]) => ClientModuleConfig;

  /**
   * Factory function to create configuration
   */
  useFactory?: (
    ...args: any[]
  ) => ClientModuleConfig | Promise<ClientModuleConfig>;
}

export interface ClientOptions {
  baseURL?: string;
  throwOnError?: boolean;
}

export interface Config<T extends ClientOptions = ClientOptions>
  extends Omit<CreateAxiosDefaults, 'auth' | 'baseURL' | 'headers' | 'method'>,
    CoreConfig {
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
  headers?:
    | AxiosRequestHeaders
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
   * Throw an error instead of returning it in the response?
   *
   * @default false
   */
  throwOnError?: T['throwOnError'];
}

/**
 * Request options interface similar to axios client
 */
export interface RequestOptions<
  ThrowOnError extends boolean = boolean,
  Url extends string = string,
> extends Config<{
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

export interface TDataShape {
  body?: unknown;
  headers?: unknown;
  path?: unknown;
  query?: unknown;
  url: string;
}

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * Options type for service method calls
 */
export type Options<
  TData extends TDataShape = TDataShape,
  ThrowOnError extends boolean = boolean,
> = OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'path' | 'query' | 'url'> &
  TData;

/**
 * Request result type that handles both success and error cases
 */
export type RequestResult<
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = boolean,
> = ThrowOnError extends true
  ? Promise<
      AxiosResponse<
        TData extends Record<string, unknown> ? TData[keyof TData] : TData
      >
    >
  : Promise<
      | (AxiosResponse<
          TData extends Record<string, unknown> ? TData[keyof TData] : TData
        > & { error: undefined })
      | (AxiosError<
          TError extends Record<string, unknown> ? TError[keyof TError] : TError
        > & {
          data: undefined;
          error: TError extends Record<string, unknown>
            ? TError[keyof TError]
            : TError;
        })
    >;
