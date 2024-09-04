import type { OpenApiComponents } from './OpenApiComponents';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiInfo } from './OpenApiInfo';
import type { OpenApiPaths } from './OpenApiPaths';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';
import type { OpenApiServer } from './OpenApiServer';
import type { OpenApiTag } from './OpenApiTag';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md
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
