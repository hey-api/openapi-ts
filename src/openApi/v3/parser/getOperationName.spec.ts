import { getOperationName } from './getOperationName';

describe('getOperationName', () => {
    it('should produce correct result', () => {
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, undefined)).toEqual('getApiUsers');
        expect(getOperationName('/api/v{api-version}/users', 'POST', false, undefined)).toEqual('postApiUsers');
        expect(getOperationName('/api/v1/users', 'GET', false, 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v1/users', 'GET', false, undefined)).toEqual('getApiV1Users');
        expect(getOperationName('/api/v1/users', 'POST', false, undefined)).toEqual('postApiV1Users');
        expect(getOperationName('/api/v1/users/{id}', 'GET', false, undefined)).toEqual('getApiV1UsersById');
        expect(getOperationName('/api/v1/users/{id}', 'POST', false, undefined)).toEqual('postApiV1UsersById');

        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'fooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'FooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'Foo Bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'foo bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'foo-bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'foo_bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, 'foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, '@foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, '$foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, '_foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, '-foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', false, '123.foo.bar')).toEqual('fooBar');

        expect(getOperationName('/api/v1/users', 'GET', true, 'GetAllUsers')).toEqual('getApiV1Users');
        expect(getOperationName('/api/v{api-version}/users', 'GET', true, 'fooBar')).toEqual('getApiUsers');
        expect(
            getOperationName('/api/v{api-version}/users/{userId}/location/{locationId}', 'GET', true, 'fooBar')
        ).toEqual('getApiUsersByUserIdLocationByLocationId');
    });
});
