import { describe, expect, it } from 'vitest';

import { getPattern } from '../getPattern';

describe('getPattern', () => {
    it.each([
        { pattern: undefined, expected: undefined },
        { pattern: '', expected: '' },
        { pattern: '^[a-zA-Z]', expected: '^[a-zA-Z]' },
        { pattern: '^\\w+$', expected: '^\\\\w+$' },
        { pattern: '^\\d{3}-\\d{2}-\\d{4}$', expected: '^\\\\d{3}-\\\\d{2}-\\\\d{4}$' },
        { pattern: '\\', expected: '\\\\' },
        { pattern: '\\/', expected: '\\\\/' },
        { pattern: '\\/\\/', expected: '\\\\/\\\\/' },
        { pattern: "'", expected: "\\'" },
    ])('getPattern($pattern) -> $expected', ({ pattern, expected }) => {
        expect(getPattern(pattern)).toEqual(expected);
    });
});
