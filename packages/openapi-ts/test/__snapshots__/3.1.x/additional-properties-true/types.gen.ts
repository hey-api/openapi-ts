// This file is auto-generated by @hey-api/openapi-ts

export type Foo = {
    foo: string;
    [key: string]: unknown | string;
};

export type Bar = Foo & {
    [key: string]: unknown;
};

export type Baz = Foo & {
    bar: string;
    [key: string]: unknown | string;
};

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};