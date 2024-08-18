import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiInfo } from './OpenApiInfo';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiPath } from './OpenApiPath';
import type { OpenApiResponse } from './OpenApiResponse';
import type { OpenApiSchema } from './OpenApiSchema';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';
import type { OpenApiSecurityScheme } from './OpenApiSecurityScheme';
import type { OpenApiTag } from './OpenApiTag';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md
 */
export interface OpenApi {
  basePath?: string;
  consumes?: string[];
  definitions?: Dictionary<OpenApiSchema>;
  externalDocs?: OpenApiExternalDocs;
  host?: string;
  info: OpenApiInfo;
  parameters?: Dictionary<OpenApiParameter>;
  paths: Dictionary<OpenApiPath>;
  produces?: string[];
  responses?: Dictionary<OpenApiResponse>;
  schemes?: string[];
  security?: OpenApiSecurityRequirement[];
  securityDefinitions?: Dictionary<OpenApiSecurityScheme>;
  swagger: string;
  tags?: OpenApiTag[];
}
