import type { Dictionary } from '../../common/interfaces/Dictionary';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#oauth-flow-object
 */
export interface OpenApiOAuthFlow {
  authorizationUrl: string;
  refreshUrl?: string;
  scopes: Dictionary<string>;
  tokenUrl: string;
}
