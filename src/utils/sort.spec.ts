import { describe, expect, it } from 'vitest';

import { sort } from './sort';

describe('sort', () => {
    it('should return correct index', () => {
        expect(sort('a', 'b')).toEqual(-1);
        expect(sort('b', 'a')).toEqual(1);
        expect(sort('a', 'a')).toEqual(0);
        expect(sort('', '')).toEqual(0);
    });
});
