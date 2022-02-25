import { getOperationName } from './getOperationName';

describe('getOperationName', () => {
    it('should produce correct result', () => {
        expect(getOperationName('/api/v{api-version}/users', 'GET', 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v{api-version}/users', 'GET', undefined)).toEqual('getApiUsers');
        expect(getOperationName('/api/v{api-version}/users', 'POST', undefined)).toEqual('postApiUsers');
        expect(getOperationName('/api/v1/users', 'GET', 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v1/users', 'GET', undefined)).toEqual('getApiV1Users');
        expect(getOperationName('/api/v1/users', 'POST', undefined)).toEqual('postApiV1Users');
        expect(getOperationName('/api/v1/users/{id}', 'GET', undefined)).toEqual('getApiV1Users');
        expect(getOperationName('/api/v1/users/{id}', 'POST', undefined)).toEqual('postApiV1Users');

        expect(getOperationName('/api/v{api-version}/users', 'GET', 'fooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', 'FooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', 'Foo Bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', 'foo bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', 'foo-bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', 'foo_bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', 'foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', '@foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', '$foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', '_foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', '-foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', '123.foo.bar')).toEqual('fooBar');
    });
});
