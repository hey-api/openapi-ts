/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import type { ApiResult } from './ApiResult';
import { OpenAPI } from './OpenAPI';

export async function request(options: ApiRequestOptions): Promise<ApiResult> {

    const url = `${OpenAPI.BASE}${options.path}`;

    // Do your request...

    return {
        url,
        ok: true,
        status: 200,
        statusText: 'dummy',
        body: {
            ...options
        },
    };
}
