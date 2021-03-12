/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import { CancelablePromise } from './CancelablePromise';
import { OpenAPI } from './OpenAPI';

export function request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    return new CancelablePromise((resolve, reject, cancel) => {
        const url = `${OpenAPI.BASE}${options.path}`;

        // Do your request...

        resolve({
            ...options
        });
    });
}
