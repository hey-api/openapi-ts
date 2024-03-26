import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#header-object
 */
export interface OpenApiHeader extends OpenApiReference {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Dictionary<OpenApiExample>;
}
