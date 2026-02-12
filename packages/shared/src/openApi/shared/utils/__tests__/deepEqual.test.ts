import deepEqual from '../deepEqual';

describe('deepEqual', () => {
  const scenarios: Array<{
    a: unknown;
    b: unknown;
    equal: boolean;
    name: string;
  }> = [
    // Primitives
    { a: 1, b: 1, equal: true, name: 'numbers equal' },
    { a: 1, b: 2, equal: false, name: 'numbers not equal' },
    { a: 'a', b: 'a', equal: true, name: 'strings equal' },
    { a: 'a', b: 'b', equal: false, name: 'strings not equal' },
    { a: true, b: true, equal: true, name: 'booleans equal' },
    { a: true, b: false, equal: false, name: 'booleans not equal' },
    { a: null, b: null, equal: true, name: 'null equal' },
    { a: null, b: {}, equal: false, name: 'null vs object' },
    { a: undefined, b: undefined, equal: true, name: 'undefined equal' },
    { a: 1, b: '1', equal: false, name: 'number vs string' },
    {
      a: Number.NaN,
      b: Number.NaN,
      equal: false,
      name: 'NaN vs NaN (not equal)',
    },

    // Arrays
    { a: [1, 2], b: [1, 2], equal: true, name: 'arrays equal' },
    { a: [1, 2], b: [2, 1], equal: false, name: 'arrays different order' },
    { a: [1], b: [1, 2], equal: false, name: 'arrays different length' },
    {
      a: [{ a: 1 }, 2, [3, 4]],
      b: [{ a: 1 }, 2, [3, 4]],
      equal: true,
      name: 'nested arrays and objects equal',
    },

    // Objects
    {
      a: { a: 1, b: 2 },
      b: { a: 1, b: 2 },
      equal: true,
      name: 'objects equal different key order',
    },
    {
      a: { a: 1 },
      b: { a: 1, b: 2 },
      equal: false,
      name: 'objects different keys',
    },
    {
      a: { a: { b: 2 } },
      b: { a: { b: 2 } },
      equal: true,
      name: 'objects nested equal',
    },
    {
      a: { a: { b: 2 } },
      b: { a: { b: 3 } },
      equal: false,
      name: 'objects nested not equal',
    },
    {
      a: { a: undefined },
      b: { a: undefined },
      equal: true,
      name: 'object with undefined values equal',
    },

    // Mismatched types
    { a: [], b: {}, equal: false, name: 'array vs object' },
  ];

  it.each(scenarios)('compares $name', async ({ a, b, equal }) => {
    expect(deepEqual(a, b)).toBe(equal);
  });
});
