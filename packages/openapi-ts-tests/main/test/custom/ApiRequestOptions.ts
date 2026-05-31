export type ParseAs = 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'stream' | 'text';

export interface ApiRequestOptions<T = unknown, P extends ParseAs | undefined = undefined> {
  body?: unknown;
  headers?: Record<string, string>;
  method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';
  parseAs?: P;
  path: string;
  query?: Record<string, unknown>;
  responseType?: T;
}
