import type { OpenApiResponse } from './OpenApiResponse';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responses-object
 */
interface Response {
  [httpcode: string]: OpenApiResponse;
}

export type OpenApiResponses = Response & {
  default?: OpenApiResponse;
};
