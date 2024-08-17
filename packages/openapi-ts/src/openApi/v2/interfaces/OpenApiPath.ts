import type { OpenApiOperation } from './OpenApiOperation';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiReference } from './OpenApiReference';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#path-item-object
 */
export interface OpenApiPath extends OpenApiReference {
  connect?: OpenApiOperation;
  delete?: OpenApiOperation;
  get?: OpenApiOperation;
  head?: OpenApiOperation;
  options?: OpenApiOperation;
  parameters?: OpenApiParameter[];
  patch?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  trace?: OpenApiOperation;
}
