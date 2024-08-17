import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * add only one type for now as that's needed to resolve the reported issue,
 * more types should be added though
 * {@link https://github.com/hey-api/openapi-ts/issues/612}
 */
type MediaType = 'application/json';

/**
 * encoding interface should be added, not adding it for now as it's not needed
 * to resolve the issue reported
 * {@link https://github.com/hey-api/openapi-ts/issues/612}
 */
interface MediaTypeObject {
  example?: unknown;
  examples?: Dictionary<OpenApiExample>;
  schema: OpenApiSchema;
  // encoding?
}

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-object
 */
export interface OpenApiParameter extends OpenApiReference {
  allowEmptyValue?: boolean;
  allowReserved?: boolean;
  content?: Record<MediaType, MediaTypeObject>;
  deprecated?: boolean;
  description?: string;
  example?: unknown;
  examples?: Dictionary<OpenApiExample>;
  explode?: boolean;
  in: 'cookie' | 'formData' | 'header' | 'path' | 'query';
  name: string;
  nullable?: boolean;
  required?: boolean;
  schema?: OpenApiSchema;
  style?: string;
}
