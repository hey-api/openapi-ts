// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from './client';
import type { GetFooData, GetFooResponses, PatchFooData, PatchFooResponses, PostFooData, PostFooResponses, PutFooData, PutFooResponses } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};

export const getFoo = <ThrowOnError extends boolean = false>(options: Options<GetFooData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetFooResponses, unknown, ThrowOnError>({
        url: '/foo',
        ...options
    });
};

export const patchFoo = <ThrowOnError extends boolean = false>(options?: Options<PatchFooData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).patch<PatchFooResponses, unknown, ThrowOnError>({
        url: '/foo',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

export const postFoo = <ThrowOnError extends boolean = false>(options: Options<PostFooData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostFooResponses, unknown, ThrowOnError>({
        url: '/foo',
        ...options,
        headers: {
            'content-type': 'application/json',
            ...options.headers
        }
    });
};

export const putFoo = <ThrowOnError extends boolean = false>(options: Options<PutFooData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<PutFooResponses, unknown, ThrowOnError>({
        url: '/foo',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};