import { getMappedType } from './getMappedType';

describe('getMappedType', () => {
    it('should map types to the basics', () => {
        expect(getMappedType('file')).toEqual('binary');
        expect(getMappedType('string')).toEqual('string');
        expect(getMappedType('date')).toEqual('string');
        expect(getMappedType('date-time')).toEqual('string');
        expect(getMappedType('float')).toEqual('number');
        expect(getMappedType('double')).toEqual('number');
        expect(getMappedType('short')).toEqual('number');
        expect(getMappedType('int')).toEqual('number');
        expect(getMappedType('boolean')).toEqual('boolean');
        expect(getMappedType('any')).toEqual('any');
        expect(getMappedType('object')).toEqual('any');
        expect(getMappedType('void')).toEqual('void');
        expect(getMappedType('null')).toEqual('null');
        expect(getMappedType('unknown')).toEqual(undefined);
        expect(getMappedType('')).toEqual(undefined);
    });
});
