import type { OpenApiOAuthFlow } from './OpenApiOAuthFlow';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#oauth-flows-object
 */
export interface OpenApiOAuthFlows {
  implicit?: OpenApiOAuthFlow;
  password?: OpenApiOAuthFlow;
  clientCredentials?: OpenApiOAuthFlow;
  authorizationCode?: OpenApiOAuthFlow;
}
