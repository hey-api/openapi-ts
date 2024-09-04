import type { OpenApiOperation } from './OpenApiOperation';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiServer } from './OpenApiServer';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#path-item-object
 */
export interface OpenApiPath {
  connect?: OpenApiOperation;
  delete?: OpenApiOperation;
  description?: string;
  get?: OpenApiOperation;
  head?: OpenApiOperation;
  options?: OpenApiOperation;
  parameters?: OpenApiParameter[];
  patch?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  servers?: OpenApiServer[];
  summary?: string;
  trace?: OpenApiOperation;
}
