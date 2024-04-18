import type { OpenApiPath } from './OpenApiPath';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#paths-object
 */
export interface OpenApiPaths {
  [path: string]: OpenApiPath;
}
