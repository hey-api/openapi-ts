// This file is auto-generated by @hey-api/openapi-ts

export type GetFooData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/foo';
};

export type GetFooResponses = {
    200: string;
};

export type GetFooResponse = GetFooResponses[keyof GetFooResponses];

export type GetBarData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/bar';
};

export type GetBarResponses = {
    200: Blob | File;
};

export type GetBarResponse = GetBarResponses[keyof GetBarResponses];