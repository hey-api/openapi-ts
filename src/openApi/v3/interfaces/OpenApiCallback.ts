import type { OpenApiPath } from './OpenApiPath';
import type { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#callbackObject
 */
interface Callback {
    [key: string]: OpenApiPath;
}

export type OpenApiCallback = OpenApiReference & Callback;
