import { describe, expect, it } from 'vitest';

import { getOperationName, getOperationParameterName, getOperationResponseCode } from '../operation';

describe('getOperationName', () => {
    const options1: Parameters<typeof getOperationName>[2] = {
        operationId: true,
    };

    const options2: Parameters<typeof getOperationName>[2] = {
        operationId: false,
    };

    it.each([
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'GetAllUsers',
            expected: 'getAllUsers',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: undefined,
            expected: 'getApiUsers',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'POST',
            options: options1,
            operationId: undefined,
            expected: 'postApiUsers',
        },
        { url: '/api/v1/users', method: 'GET', options: options1, operationId: 'GetAllUsers', expected: 'getAllUsers' },
        { url: '/api/v1/users', method: 'GET', options: options1, operationId: undefined, expected: 'getApiV1Users' },
        { url: '/api/v1/users', method: 'POST', options: options1, operationId: undefined, expected: 'postApiV1Users' },
        {
            url: '/api/v1/users/{id}',
            method: 'GET',
            options: options1,
            operationId: undefined,
            expected: 'getApiV1UsersById',
        },
        {
            url: '/api/v1/users/{id}',
            method: 'POST',
            options: options1,
            operationId: undefined,
            expected: 'postApiV1UsersById',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'fooBar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'FooBar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'Foo Bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'foo bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'foo-bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'foo_bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: 'foo.bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: '@foo.bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: '$foo.bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: '_foo.bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: '-foo.bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options1,
            operationId: '123.foo.bar',
            expected: 'fooBar',
        },
        {
            url: '/api/v1/users',
            method: 'GET',
            options: options2,
            operationId: 'GetAllUsers',
            expected: 'getApiV1Users',
        },
        {
            url: '/api/v{api-version}/users',
            method: 'GET',
            options: options2,
            operationId: 'fooBar',
            expected: 'getApiUsers',
        },
        {
            url: '/api/v{api-version}/users/{userId}/location/{locationId}',
            method: 'GET',
            options: options2,
            operationId: 'fooBar',
            expected: 'getApiUsersByUserIdLocationByLocationId',
        },
    ])(
        'getOperationName($url, $method, { operationId: $useOperationId }, $operationId) -> $expected',
        ({ url, method, options, operationId, expected }) => {
            expect(getOperationName(url, method, options, operationId)).toEqual(expected);
        }
    );
});

describe('getOperationParameterName', () => {
    it.each([
        { input: '', expected: '' },
        { input: 'foobar', expected: 'foobar' },
        { input: 'fooBar', expected: 'fooBar' },
        { input: 'foo_bar', expected: 'fooBar' },
        { input: 'foo-bar', expected: 'fooBar' },
        { input: 'foo.bar', expected: 'fooBar' },
        { input: '@foo.bar', expected: 'fooBar' },
        { input: '$foo.bar', expected: 'fooBar' },
        { input: '123.foo.bar', expected: 'fooBar' },
        { input: 'Foo-Bar', expected: 'fooBar' },
        { input: 'FOO-BAR', expected: 'fooBar' },
        { input: 'foo[bar]', expected: 'fooBar' },
        { input: 'foo.bar[]', expected: 'fooBarArray' },
    ])('getOperationParameterName($input) -> $expected', ({ input, expected }) => {
        expect(getOperationParameterName(input)).toEqual(expected);
    });
});

describe('getOperationResponseCode', () => {
    it.each([
        { input: '', expected: null },
        { input: 'default', expected: 200 },
        { input: '200', expected: 200 },
        { input: '300', expected: 300 },
        { input: '400', expected: 400 },
        { input: 'abc', expected: null },
        { input: '-100', expected: 100 },
    ])('getOperationResponseCode($input) -> $expected', ({ input, expected }) => {
        expect(getOperationResponseCode(input)).toEqual(expected);
    });
});
