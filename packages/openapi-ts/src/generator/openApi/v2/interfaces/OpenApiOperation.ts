import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiResponses } from './OpenApiResponses';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#operation-object
 */
export interface OpenApiOperation {
  consumes?: string[];
  deprecated?: boolean;
  description?: string;
  externalDocs?: OpenApiExternalDocs;
  operationId?: string;
  parameters?: OpenApiParameter[];
  produces?: string[];
  responses: OpenApiResponses;
  schemes?: ('http' | 'https' | 'ws' | 'wss')[];
  security?: OpenApiSecurityRequirement[];
  summary?: string;
  tags?: string[];
}
