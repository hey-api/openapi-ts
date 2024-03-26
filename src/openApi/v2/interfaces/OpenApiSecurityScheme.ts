import type { Dictionary } from '../../common/interfaces/Dictionary';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#security-scheme-object
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
