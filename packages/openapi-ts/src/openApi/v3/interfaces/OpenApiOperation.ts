import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiCallback } from './OpenApiCallback';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiRequestBody } from './OpenApiRequestBody';
import type { OpenApiResponses } from './OpenApiResponses';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';
import type { OpenApiServer } from './OpenApiServer';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#operation-object
 */
export interface OpenApiOperation {
  callbacks?: Dictionary<OpenApiCallback>;
  deprecated?: boolean;
  description?: string;
  externalDocs?: OpenApiExternalDocs;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: OpenApiResponses;
  security?: OpenApiSecurityRequirement[];
  servers?: OpenApiServer[];
  summary?: string;
  tags?: string[];
}
