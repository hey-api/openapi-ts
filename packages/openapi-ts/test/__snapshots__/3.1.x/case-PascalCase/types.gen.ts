// This file is auto-generated by @hey-api/openapi-ts

/**
 * original name: 201
 */
export type _201 = number;

/**
 * original name: Foo
 */
export type Foo = {
    /**
     * original name: fooBar
     */
    fooBar: FooBar;
    /**
     * original name: BarBaz
     */
    BarBaz: Foo;
    /**
     * original name: qux_quux
     */
    qux_quux: {
        /**
         * original name: fooBar
         */
        fooBar: FooBar2;
        /**
         * original name: BarBaz
         */
        BarBaz: FooBar3;
        /**
         * original name: qux_quux
         */
        qux_quux: boolean;
    };
};

/**
 * original name: foo_bar
 */
export type FooBar = boolean;

/**
 * original name: fooBar
 */
export type FooBar2 = number;

/**
 * original name: FooBar
 */
export type FooBar3 = string;

export type GetFooData = {
    body: Foo;
    path?: never;
    query: {
        /**
         * original name: fooBar
         */
        fooBar: string;
        /**
         * original name: BarBaz
         */
        BarBaz: string;
        /**
         * original name: qux_quux
         */
        qux_quux: string;
    };
    url: '/foo';
};

export type GetFooResponses = {
    /**
     * OK
     */
    200: Foo;
    /**
     * OK
     */
    201: _201;
};

export type GetFooResponse = GetFooResponses[keyof GetFooResponses];

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};