import type { ApiRequestOptions } from './ApiRequestOptions';
import { CancelablePromise } from './CancelablePromise';
import type { OpenAPIConfig } from './OpenAPI';

export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {
    return new CancelablePromise((resolve, reject, onCancel) => {
        const url = `${config.BASE}${options.path}`.replace('{api-version}', config.VERSION);

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
};
