import type { Dictionary } from '../../../types/generic';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#parameter-object
 */
export interface OpenApiParameter extends OpenApiReference {
    name: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'cookie';
    description?: string;
    required?: boolean;
    nullable?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Dictionary<OpenApiExample>;
}
