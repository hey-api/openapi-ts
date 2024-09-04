import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiEncoding } from './OpenApiEncoding';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#media-type-object
 */
export interface OpenApiMediaType extends OpenApiReference {
  encoding?: Dictionary<OpenApiEncoding>;
  example?: unknown;
  examples?: Dictionary<OpenApiExample>;
  schema?: OpenApiSchema;
}
