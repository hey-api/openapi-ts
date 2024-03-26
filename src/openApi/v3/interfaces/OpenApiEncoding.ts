import type { Dictionary } from '../../../types/generic';
import type { OpenApiHeader } from './OpenApiHeader';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#encoding-object
 */
export interface OpenApiEncoding {
    contentType?: string;
    headers?: Dictionary<OpenApiHeader>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}
