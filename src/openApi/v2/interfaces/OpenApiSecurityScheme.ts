import type { Dictionary } from '../../../utils/types';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#securitySchemeObject
 */
export interface OpenApiSecurityScheme {
    type: 'basic' | 'apiKey' | 'oauth2';
    description?: string;
    name?: string;
    in?: 'query' | 'header';
    flow?: 'implicit' | 'password' | 'application' | 'accessCode';
    authorizationUrl?: string;
    tokenUrl?: string;
    scopes: Dictionary<string>;
}
