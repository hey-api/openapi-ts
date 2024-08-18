import type { OpenApiOAuthFlow } from './OpenApiOAuthFlow';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#oauth-flows-object
 */
export interface OpenApiOAuthFlows {
  authorizationCode?: OpenApiOAuthFlow;
  clientCredentials?: OpenApiOAuthFlow;
  implicit?: OpenApiOAuthFlow;
  password?: OpenApiOAuthFlow;
}
