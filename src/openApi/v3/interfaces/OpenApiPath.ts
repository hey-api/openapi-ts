import type { OpenApiOperation } from './OpenApiOperation';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiServer } from './OpenApiServer';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#pathItemObject
 */
export interface OpenApiPath {
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
