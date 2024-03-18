import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiResponse } from './OpenApiResponse';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responsesObject
 */
interface Response {
    [httpcode: string]: OpenApiResponse;
}

export type OpenApiResponses = OpenApiReference &
    Response & {
        default: OpenApiResponse;
    };
