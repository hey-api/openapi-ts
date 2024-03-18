import type { Dictionary } from '../../../utils/types';
import type { OpenApiMediaType } from './OpenApiMediaType';
import type { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#requestBodyObject
 */
export interface OpenApiRequestBody extends OpenApiReference {
    'x-body-name'?: string;
    content: Dictionary<OpenApiMediaType>;
    description?: string;
    nullable?: boolean;
    required?: boolean;
}
