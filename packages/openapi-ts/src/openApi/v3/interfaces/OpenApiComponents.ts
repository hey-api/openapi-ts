import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiCallback } from './OpenApiCallback';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiHeader } from './OpenApiHeader';
import type { OpenApiLink } from './OpenApiLink';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiRequestBody } from './OpenApiRequestBody';
import type { OpenApiResponses } from './OpenApiResponses';
import type { OpenApiSchema } from './OpenApiSchema';
import type { OpenApiSecurityScheme } from './OpenApiSecurityScheme';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#components-object
 */
export interface OpenApiComponents {
  callbacks?: Dictionary<OpenApiCallback>;
  examples?: Dictionary<OpenApiExample>;
  headers?: Dictionary<OpenApiHeader>;
  links?: Dictionary<OpenApiLink>;
  parameters?: Dictionary<OpenApiParameter>;
  requestBodies?: Dictionary<OpenApiRequestBody>;
  responses?: Dictionary<OpenApiResponses>;
  schemas?: Dictionary<OpenApiSchema>;
  securitySchemes?: Dictionary<OpenApiSecurityScheme>;
}
