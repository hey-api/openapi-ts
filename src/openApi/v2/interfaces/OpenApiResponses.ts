import type { OpenApiResponse } from './OpenApiResponse';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
 */
interface Response {
    [httpcode: string]: OpenApiResponse;
}

export type OpenApiResponses = Response & {
    default?: OpenApiResponse;
};
