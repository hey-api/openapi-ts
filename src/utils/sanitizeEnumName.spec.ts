import sanitizeEnumName from './sanitizeEnumName';

describe('sanitizeEnumName', () => {
    it('should replace illegal characters', () => {
        expect(sanitizeEnumName('abc')).toEqual('ABC');
        expect(sanitizeEnumName('æbc')).toEqual('ÆBC');
        expect(sanitizeEnumName('æb.c')).toEqual('ÆB_C');
        expect(sanitizeEnumName('1æb.c')).toEqual('_1ÆB_C');
        expect(sanitizeEnumName("'quoted'")).toEqual('_QUOTED_');
    });
});
