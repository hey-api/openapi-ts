import type { Options } from '../../../client/interfaces/Options';
import { getOperationName } from './getOperationName';

describe('getOperationName', () => {
    it('should produce correct result', () => {
        const options: Options = {
            input: '',
            output: '',
        };
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, undefined)).toEqual('getApiUsers');
        expect(getOperationName('/api/v{api-version}/users', 'POST', options, undefined)).toEqual('postApiUsers');
        expect(getOperationName('/api/v1/users', 'GET', options, 'GetAllUsers')).toEqual('getAllUsers');
        expect(getOperationName('/api/v1/users', 'GET', options, undefined)).toEqual('getApiV1Users');
        expect(getOperationName('/api/v1/users', 'POST', options, undefined)).toEqual('postApiV1Users');
        expect(getOperationName('/api/v1/users/{id}', 'GET', options, undefined)).toEqual('getApiV1UsersById');
        expect(getOperationName('/api/v1/users/{id}', 'POST', options, undefined)).toEqual('postApiV1UsersById');

        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'fooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'FooBar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'Foo Bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'foo bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'foo-bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'foo_bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, 'foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, '@foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, '$foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, '_foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, '-foo.bar')).toEqual('fooBar');
        expect(getOperationName('/api/v{api-version}/users', 'GET', options, '123.foo.bar')).toEqual('fooBar');

        const optionsIgnoreOperationId: Options = {
            ...options,
            useOperationId: false,
        };
        expect(getOperationName('/api/v1/users', 'GET', optionsIgnoreOperationId, 'GetAllUsers')).toEqual(
            'getApiV1Users'
        );
        expect(getOperationName('/api/v{api-version}/users', 'GET', optionsIgnoreOperationId, 'fooBar')).toEqual(
            'getApiUsers'
        );
        expect(
            getOperationName(
                '/api/v{api-version}/users/{userId}/location/{locationId}',
                'GET',
                optionsIgnoreOperationId,
                'fooBar'
            )
        ).toEqual('getApiUsersByUserIdLocationByLocationId');
    });
});
