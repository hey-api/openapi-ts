export interface OpenAPIConfig {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS?: boolean;
  CREDENTIALS?: 'include' | 'omit' | 'same-origin';
  TOKEN?: string | ((options: unknown) => Promise<string>);
  USERNAME?: string;
  PASSWORD?: string;
  HEADERS?: Record<string, string>;
  ENCODE_PATH?: (path: string) => string;
}

export const OpenAPI: OpenAPIConfig = {
  BASE: '',
  VERSION: '0',
};
