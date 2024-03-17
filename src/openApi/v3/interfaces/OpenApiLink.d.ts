import type { Dictionary } from '../../../utils/types';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiServer } from './OpenApiServer';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#linkObject
 */
export interface OpenApiLink extends OpenApiReference {
    operationRef?: string;
    operationId?: string;
    parameters?: Dictionary<unknown>;
    requestBody?: unknown;
    description?: string;
    server?: OpenApiServer;
}
