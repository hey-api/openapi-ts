import { describe, expect, it } from 'vitest';

import { unique } from '../unique';

describe('unique', () => {
    it.each([
        { value: 'a', index: 0, arr: ['a', 'b', 'c'], result: true },
        { value: 'a', index: 1, arr: ['a', 'b', 'c'], result: false },
        { value: 'a', index: 2, arr: ['a', 'b', 'c'], result: false },
        { value: 'a', index: 1, arr: ['z', 'a', 'b'], result: true },
        { value: 'a', index: 2, arr: ['y', 'z', 'a'], result: true },
    ])('unique($value, $index, $arr) === $result', ({ value, index, arr, result }) => {
        expect(unique(value, index, arr)).toEqual(result);
    });

    it.each([
        { input: ['a', 'a', 'b', 'c', 'b', 'b'], expected: ['a', 'b', 'c'] },
        { input: [1, 2, 3, 4, 4, 5, 6, 3], expected: [1, 2, 3, 4, 5, 6] },
    ])('should filter: $input to the unique array: $expected', ({ input, expected }) => {
        expect(input.filter(unique)).toEqual(expected);
    });
});
