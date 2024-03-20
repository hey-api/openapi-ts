import type { Dictionary } from '../../../types/generic';
import type { OpenApiServerVariable } from './OpenApiServerVariable';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#serverObject
 */
export interface OpenApiServer {
    url: string;
    description?: string;
    variables?: Dictionary<OpenApiServerVariable>;
}
