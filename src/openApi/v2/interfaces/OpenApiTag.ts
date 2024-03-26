import type { OpenApiExternalDocs } from './OpenApiExternalDocs';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#tag-object
 */
export interface OpenApiTag {
    name: string;
    description?: string;
    externalDocs?: OpenApiExternalDocs;
}
