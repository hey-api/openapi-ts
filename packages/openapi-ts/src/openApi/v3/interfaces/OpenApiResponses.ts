import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiResponse } from './OpenApiResponse';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#responses-object
 */
interface Response {
  [httpcode: string]: OpenApiResponse;
}

export type OpenApiResponses = OpenApiReference &
  Response & {
    default: OpenApiResponse;
  };
