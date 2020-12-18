import { getPattern } from './getPattern';

describe('getPattern', () => {
    it('should produce correct result', () => {
        expect(getPattern()).toEqual(undefined);
        expect(getPattern('')).toEqual('');
        expect(getPattern('^[a-zA-Z]')).toEqual('^[a-zA-Z]');
        expect(getPattern('^\\w+$')).toEqual('^\\\\w+$');
        expect(getPattern('^\\d{3}-\\d{2}-\\d{4}$')).toEqual('^\\\\d{3}-\\\\d{2}-\\\\d{4}$');
        expect(getPattern('\\')).toEqual('\\\\');
        expect(getPattern('\\/')).toEqual('\\\\/');
        expect(getPattern('\\/\\/')).toEqual('\\\\/\\\\/');
    });
});
