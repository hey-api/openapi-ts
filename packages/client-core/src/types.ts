export type ApiResult<TData = any> = {
  readonly body: TData;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
};

export type ApiRequestOptions<T = unknown> = {
  readonly body?: any;
  readonly cookies?: Record<string, unknown>;
  readonly errors?: Record<number | string, string>;
  readonly formData?: Record<string, unknown> | any[];
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
  readonly responseTransformer?: (data: unknown) => Promise<T>;
  readonly url: string;
};

export type Headers = Record<string, string>;
export type Middleware<T> = (value: T) => T | Promise<T>;
export type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
