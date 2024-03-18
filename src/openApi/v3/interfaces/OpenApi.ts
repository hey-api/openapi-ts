import type { OpenApiComponents } from './OpenApiComponents';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiInfo } from './OpenApiInfo';
import type { OpenApiPaths } from './OpenApiPaths';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';
import type { OpenApiServer } from './OpenApiServer';
import type { OpenApiTag } from './OpenApiTag';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md
 */
export interface OpenApi {
    components?: OpenApiComponents;
    externalDocs?: OpenApiExternalDocs;
    info: OpenApiInfo;
    openapi: string;
    paths: OpenApiPaths;
    security?: OpenApiSecurityRequirement[];
    servers?: OpenApiServer[];
    tags?: OpenApiTag[];
}
