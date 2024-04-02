import { describe, expect, it } from 'vitest';

import { toSortedByRequired } from '../sort';

describe('sort', () => {
    it.each([
        {
            input: [
                { id: 'test', isRequired: false },
                { id: 'test2', isRequired: true },
                { id: 'test3', isRequired: true },
            ],
            expected: [
                { id: 'test2', isRequired: true },
                { id: 'test3', isRequired: true },
                { id: 'test', isRequired: false },
            ],
        },
        {
            input: [
                { id: 'test', isRequired: false },
                { id: 'test2', isRequired: false },
                { id: 'test3', isRequired: true, default: 'something' },
            ],
            expected: [
                { id: 'test', isRequired: false },
                { id: 'test2', isRequired: false },
                { id: 'test3', isRequired: true, default: 'something' },
            ],
        },
    ])('should sort $input by required to produce $expected', ({ input, expected }) => {
        expect(toSortedByRequired(input)).toEqual(expected);
    });
});
