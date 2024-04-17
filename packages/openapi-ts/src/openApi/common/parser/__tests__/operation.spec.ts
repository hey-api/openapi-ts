import { describe, expect, it } from 'vitest';

import { setConfig } from '../../../../utils/config';
import { getOperationName, getOperationParameterName, getOperationResponseCode } from '../operation';

describe('getOperationName', () => {
    const options1: Parameters<typeof setConfig>[0] = {
        client: 'fetch',
        debug: false,
        dryRun: true,
        enums: false,
        exportCore: false,
        exportServices: false,
        format: false,
        input: '',
        lint: false,
        operationId: true,
        output: '',
        postfixServices: '',
        schemas: false,
        serviceResponse: 'body',
        types: {
            export: false,
        },
        useDateType: false,
        useOptions: false,
    };

    const options2: Parameters<typeof setConfig>[0] = {
        client: 'fetch',
        debug: false,
        dryRun: true,
        enums: false,
        exportCore: false,
        exportServices: false,
        format: false,
        input: '',
        lint: false,
        operationId: false,
        output: '',
        postfixServices: '',
        schemas: false,
        serviceResponse: 'body',
        types: {
            export: false,
        },
        useDateType: false,
        useOptions: false,
    };

    it.each([
        {
            expected: 'getAllUsers',
            method: 'GET',
            operationId: 'GetAllUsers',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'getApiUsers',
            method: 'GET',
            operationId: undefined,
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'postApiUsers',
            method: 'POST',
            operationId: undefined,
            options: options1,
            url: '/api/v{api-version}/users',
        },
        { expected: 'getAllUsers', method: 'GET', operationId: 'GetAllUsers', options: options1, url: '/api/v1/users' },
        { expected: 'getApiV1Users', method: 'GET', operationId: undefined, options: options1, url: '/api/v1/users' },
        { expected: 'postApiV1Users', method: 'POST', operationId: undefined, options: options1, url: '/api/v1/users' },
        {
            expected: 'getApiV1UsersById',
            method: 'GET',
            operationId: undefined,
            options: options1,
            url: '/api/v1/users/{id}',
        },
        {
            expected: 'postApiV1UsersById',
            method: 'POST',
            operationId: undefined,
            options: options1,
            url: '/api/v1/users/{id}',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: 'fooBar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: 'FooBar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: 'Foo Bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: 'foo bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: 'foo-bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: 'foo_bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: 'foo.bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: '@foo.bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: '$foo.bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: '_foo.bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: '-foo.bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'fooBar',
            method: 'GET',
            operationId: '123.foo.bar',
            options: options1,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'getApiV1Users',
            method: 'GET',
            operationId: 'GetAllUsers',
            options: options2,
            url: '/api/v1/users',
        },
        {
            expected: 'getApiUsers',
            method: 'GET',
            operationId: 'fooBar',
            options: options2,
            url: '/api/v{api-version}/users',
        },
        {
            expected: 'getApiUsersByUserIdLocationByLocationId',
            method: 'GET',
            operationId: 'fooBar',
            options: options2,
            url: '/api/v{api-version}/users/{userId}/location/{locationId}',
        },
    ])(
        'getOperationName($url, $method, { operationId: $useOperationId }, $operationId) -> $expected',
        ({ url, method, options, operationId, expected }) => {
            setConfig(options);
            expect(getOperationName(url, method, operationId)).toBe(expected);
        }
    );
});

describe('getOperationParameterName', () => {
    it.each([
        { expected: '', input: '' },
        { expected: 'foobar', input: 'foobar' },
        { expected: 'fooBar', input: 'fooBar' },
        { expected: 'fooBar', input: 'foo_bar' },
        { expected: 'fooBar', input: 'foo-bar' },
        { expected: 'fooBar', input: 'foo.bar' },
        { expected: 'fooBar', input: '@foo.bar' },
        { expected: 'fooBar', input: '$foo.bar' },
        { expected: 'fooBar', input: '123.foo.bar' },
        { expected: 'fooBar', input: 'Foo-Bar' },
        { expected: 'fooBar', input: 'FOO-BAR' },
        { expected: 'fooBar', input: 'foo[bar]' },
        { expected: 'fooBarArray', input: 'foo.bar[]' },
    ])('getOperationParameterName($input) -> $expected', ({ input, expected }) => {
        expect(getOperationParameterName(input)).toBe(expected);
    });
});

describe('getOperationResponseCode', () => {
    it.each([
        { expected: null, input: '' },
        { expected: 200, input: 'default' },
        { expected: 200, input: '200' },
        { expected: 300, input: '300' },
        { expected: 400, input: '400' },
        { expected: null, input: 'abc' },
        { expected: 100, input: '-100' },
    ])('getOperationResponseCode($input) -> $expected', ({ input, expected }) => {
        expect(getOperationResponseCode(input)).toBe(expected);
    });
});
