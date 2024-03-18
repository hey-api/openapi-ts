import type { Dictionary } from '../../../utils/types';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiHeader } from './OpenApiHeader';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responseObject
 */
export interface OpenApiResponse extends OpenApiReference {
    description: string;
    schema?: OpenApiSchema & OpenApiReference;
    headers?: Dictionary<OpenApiHeader>;
    examples?: OpenApiExample;
}
