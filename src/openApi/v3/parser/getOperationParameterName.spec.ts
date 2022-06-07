import { getOperationParameterName } from './getOperationParameterName';

describe('getOperationParameterName', () => {
    it('should produce correct result', () => {
        expect(getOperationParameterName('')).toEqual('');
        expect(getOperationParameterName('foobar')).toEqual('foobar');
        expect(getOperationParameterName('fooBar')).toEqual('fooBar');
        expect(getOperationParameterName('foo_bar')).toEqual('fooBar');
        expect(getOperationParameterName('foo-bar')).toEqual('fooBar');
        expect(getOperationParameterName('foo.bar')).toEqual('fooBar');
        expect(getOperationParameterName('@foo.bar')).toEqual('fooBar');
        expect(getOperationParameterName('$foo.bar')).toEqual('fooBar');
        expect(getOperationParameterName('123.foo.bar')).toEqual('fooBar');
        expect(getOperationParameterName('Foo-Bar')).toEqual('fooBar');
        expect(getOperationParameterName('FOO-BAR')).toEqual('fooBar');
        expect(getOperationParameterName('foo[bar]')).toEqual('fooBar');
        expect(getOperationParameterName('foo.bar[]')).toEqual('fooBarArray');
    });
});
