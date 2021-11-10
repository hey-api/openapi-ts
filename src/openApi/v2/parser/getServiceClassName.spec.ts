import { getServiceClassName } from './getServiceClassName';

describe('getServiceClassName', () => {
    it('should produce correct result', () => {
        expect(getServiceClassName('')).toEqual('');
        expect(getServiceClassName('FooBar')).toEqual('FooBar');
        expect(getServiceClassName('Foo Bar')).toEqual('FooBar');
        expect(getServiceClassName('foo bar')).toEqual('FooBar');
        expect(getServiceClassName('@fooBar')).toEqual('FooBar');
        expect(getServiceClassName('$fooBar')).toEqual('FooBar');
        expect(getServiceClassName('123fooBar')).toEqual('FooBar');
    });
});
