import { describe, expect, it } from 'vitest';

import { unique } from '../unique';

describe('unique', () => {
  it.each([
    { arr: ['a', 'b', 'c'], index: 0, result: true, value: 'a' },
    { arr: ['a', 'b', 'c'], index: 1, result: false, value: 'a' },
    { arr: ['a', 'b', 'c'], index: 2, result: false, value: 'a' },
    { arr: ['z', 'a', 'b'], index: 1, result: true, value: 'a' },
    { arr: ['y', 'z', 'a'], index: 2, result: true, value: 'a' },
  ])(
    'unique($value, $index, $arr) -> $result',
    ({ arr, index, result, value }) => {
      expect(unique(value, index, arr)).toEqual(result);
    },
  );

  it.each([
    { expected: ['a', 'b', 'c'], input: ['a', 'a', 'b', 'c', 'b', 'b'] },
    { expected: [1, 2, 3, 4, 5, 6], input: [1, 2, 3, 4, 4, 5, 6, 3] },
  ])(
    'should filter: $input to the unique array: $expected',
    ({ expected, input }) => {
      expect(input.filter(unique)).toEqual(expected);
    },
  );
});
