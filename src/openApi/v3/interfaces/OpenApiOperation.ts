import type { Dictionary } from '../../../types/generic';
import type { OpenApiCallback } from './OpenApiCallback';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiRequestBody } from './OpenApiRequestBody';
import type { OpenApiResponses } from './OpenApiResponses';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';
import type { OpenApiServer } from './OpenApiServer';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#operation-object
 */
export interface OpenApiOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: OpenApiExternalDocs;
    operationId?: string;
    parameters?: OpenApiParameter[];
    requestBody?: OpenApiRequestBody;
    responses: OpenApiResponses;
    callbacks?: Dictionary<OpenApiCallback>;
    deprecated?: boolean;
    security?: OpenApiSecurityRequirement[];
    servers?: OpenApiServer[];
}
