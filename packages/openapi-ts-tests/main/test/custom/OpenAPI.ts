export interface OpenAPIConfig {
  BASE: string;
  CREDENTIALS?: 'include' | 'omit' | 'same-origin';
  ENCODE_PATH?: (path: string) => string;
  HEADERS?: Record<string, string>;
  PASSWORD?: string;
  TOKEN?: string | ((options: unknown) => Promise<string>);
  USERNAME?: string;
  VERSION: string;
  WITH_CREDENTIALS?: boolean;
}

export const OpenAPI: OpenAPIConfig = {
  BASE: '',
  VERSION: '0',
};
