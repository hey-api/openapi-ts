// This file is auto-generated by @hey-api/openapi-ts

export type Foo = {
    foo: string;
};

export type Bar = Foo & {
    [key: string]: never;
};

export type Baz = Foo & {
    bar: string;
};

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};