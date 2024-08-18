import type { OpenApiOAuthFlows } from './OpenApiOAuthFlows';
import type { OpenApiReference } from './OpenApiReference';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#security-scheme-object
 */
export interface OpenApiSecurityScheme extends OpenApiReference {
  bearerFormat?: string;
  description?: string;
  flows?: OpenApiOAuthFlows;
  in?: 'query' | 'header' | 'cookie';
  name?: string;
  openIdConnectUrl?: string;
  scheme?: string;
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
}
