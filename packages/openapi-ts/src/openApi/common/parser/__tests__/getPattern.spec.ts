import { describe, expect, it } from 'vitest';

import { getPattern } from '../getPattern';

describe('getPattern', () => {
    it.each([
        { expected: undefined, pattern: undefined },
        { expected: '', pattern: '' },
        { expected: '^[a-zA-Z]', pattern: '^[a-zA-Z]' },
        { expected: '^\\\\w+$', pattern: '^\\w+$' },
        { expected: '^\\\\d{3}-\\\\d{2}-\\\\d{4}$', pattern: '^\\d{3}-\\d{2}-\\d{4}$' },
        { expected: '\\\\', pattern: '\\' },
        { expected: '\\\\/', pattern: '\\/' },
        { expected: '\\\\/\\\\/', pattern: '\\/\\/' },
        { expected: "\\'", pattern: "'" },
    ])('getPattern($pattern) -> $expected', ({ pattern, expected }) => {
        expect(getPattern(pattern)).toEqual(expected);
    });
});
