import { getOperationName } from './getOperationName';

describe('getOperationName', () => {
    it('should produce correct result', () => {
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, undefined)).toEqual('getApiUsers');
        expect(getOperationName('/api/v{api-version}/users', 'POST', true, undefined)).toEqual('postApiUsers');
        expect(getOperationName('/api/v1/users', 'GET', true, 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v1/users', 'GET', true, undefined)).toEqual('getApiV1Users');
        expect(getOperationName('/api/v1/users', 'POST', true, undefined)).toEqual('postApiV1Users');
        expect(getOperationName('/api/v1/users/{id}', 'GET', true, undefined)).toEqual('getApiV1UsersById');
        expect(getOperationName('/api/v1/users/{id}', 'POST', true, undefined)).toEqual('postApiV1UsersById');

        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'fooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'FooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'Foo Bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'foo bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'foo-bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'foo_bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, '@foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, '$foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, '_foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, '-foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, '123.foo.bar')).toEqual('fooBar');

        expect(getOperationName('/api/v1/users', 'GET', false, 'GetAllUsers')).toEqual('getApiV1Users');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'fooBar')).toEqual('getApiUsers');
        expect(
            getOperationName('/api/v{api-version}/users/{userId}/location/{locationId}', 'GET', false, 'fooBar')
        ).toEqual('getApiUsersByUserIdLocationByLocationId');
    });
});
