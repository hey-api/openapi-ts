import { describe, expect, it } from 'vitest';

import sanitizeTypeName from '../sanitizeTypeName';

describe('sanitizeTypeName', () => {
    it('should remove/replace illegal characters', () => {
        expect(sanitizeTypeName('abc')).toEqual('abc');
        expect(sanitizeTypeName('æbc')).toEqual('æbc');
        expect(sanitizeTypeName('æb.c')).toEqual('æb_c');
        expect(sanitizeTypeName('1æb.c')).toEqual('æb_c');
    });
});
