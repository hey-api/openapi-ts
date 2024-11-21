import { describe, expect, it } from 'vitest';

import { parseResponseStatusCode } from '../operation';

describe('parseResponseStatusCode', () => {
  it.each([
    { expected: null, input: '' },
    { expected: 'default', input: 'default' },
    { expected: 200, input: '200' },
    { expected: 300, input: '300' },
    { expected: 400, input: '400' },
    { expected: '4XX', input: '4XX' },
    { expected: null, input: 'abc' },
    { expected: null, input: '-100' },
  ])('parseResponseStatusCode($input) -> $expected', ({ expected, input }) => {
    expect(parseResponseStatusCode(input)).toBe(expected);
  });
});
