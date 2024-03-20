import { describe, expect, it } from 'vitest';

import { unique } from '../unique';

describe('unique', () => {
    it('should return correct index', () => {
        expect(unique('a', 0, ['a', 'b', 'c'])).toBeTruthy();
        expect(unique('a', 1, ['a', 'b', 'c'])).toBeFalsy();
        expect(unique('a', 2, ['a', 'b', 'c'])).toBeFalsy();
        expect(unique('a', 0, ['a', 'b', 'c'])).toBeTruthy();
        expect(unique('a', 1, ['z', 'a', 'b'])).toBeTruthy();
        expect(unique('a', 2, ['y', 'z', 'a'])).toBeTruthy();
    });
});
