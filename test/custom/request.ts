/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import { CancelablePromise } from './CancelablePromise';
import { OpenAPI } from './OpenAPI';

export function request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    return new CancelablePromise((resolve, reject, onCancel) => {
        const url = `${OpenAPI.BASE}${options.path}`;

        try {
            // Do your request...
            const timeout = setTimeout(() => {
                resolve({
                    url,
                    ok: true,
                    status: 200,
                    statusText: 'dummy',
                    body: {
                        ...options,
                    },
                });
            }, 500);

            // Cancel your request...
            onCancel(() => {
                clearTimeout(timeout);
            });
        } catch (e) {
            reject(e);
        }
    });
}
