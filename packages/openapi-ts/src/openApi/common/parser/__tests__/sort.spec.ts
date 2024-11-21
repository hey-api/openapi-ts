import { describe, expect, it } from 'vitest';

import { toSortedByRequired } from '../sort';

describe('sort', () => {
  it.each([
    {
      expected: [
        { id: 'test2', isRequired: true },
        { id: 'test3', isRequired: true },
        { id: 'test', isRequired: false },
      ],
      input: [
        { id: 'test', isRequired: false },
        { id: 'test2', isRequired: true },
        { id: 'test3', isRequired: true },
      ],
    },
    {
      expected: [
        { id: 'test', isRequired: false },
        { id: 'test2', isRequired: false },
        { default: 'something', id: 'test3', isRequired: true },
      ],
      input: [
        { id: 'test', isRequired: false },
        { id: 'test2', isRequired: false },
        { default: 'something', id: 'test3', isRequired: true },
      ],
    },
  ])(
    'should sort $input by required to produce $expected',
    ({ expected, input }) => {
      expect(toSortedByRequired(input)).toEqual(expected);
    },
  );
});
