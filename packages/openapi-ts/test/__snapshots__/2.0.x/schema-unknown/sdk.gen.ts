// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from '@hey-api/client-fetch';
import type { SendEmailData, SendEmailResponse2, SendEmailError } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
};

/**
 * Send a single email
 */
export const sendEmail = <ThrowOnError extends boolean = false>(options: Options<SendEmailData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<SendEmailResponse2, SendEmailError, ThrowOnError>({
        url: '/email',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};