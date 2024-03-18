import type { Dictionary } from '../../../utils/types';
import type { OpenApiEncoding } from './OpenApiEncoding';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#mediaTypeObject
 */
export interface OpenApiMediaType extends OpenApiReference {
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Dictionary<OpenApiExample>;
    encoding?: Dictionary<OpenApiEncoding>;
}
