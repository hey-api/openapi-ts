import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiHeader } from './OpenApiHeader';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#response-object
 */
export interface OpenApiResponse extends OpenApiReference {
  description: string;
  examples?: OpenApiExample;
  headers?: Dictionary<OpenApiHeader>;
  schema?: OpenApiSchema & OpenApiReference;
}
