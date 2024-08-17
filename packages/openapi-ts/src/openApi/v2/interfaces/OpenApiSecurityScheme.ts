import type { Dictionary } from '../../common/interfaces/Dictionary';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#security-scheme-object
 */
export interface OpenApiSecurityScheme {
  authorizationUrl?: string;
  description?: string;
  flow?: 'implicit' | 'password' | 'application' | 'accessCode';
  in?: 'query' | 'header';
  name?: string;
  scopes: Dictionary<string>;
  tokenUrl?: string;
  type: 'basic' | 'apiKey' | 'oauth2';
}
