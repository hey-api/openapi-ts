import { describe, expect, it } from 'vitest';

import { getServiceName } from '../postprocess';

describe('getServiceName', () => {
  it.each([
    { expected: '', input: '' },
    { expected: 'FooBar', input: 'FooBar' },
    { expected: 'FooBar', input: 'Foo Bar' },
    { expected: 'FooBar', input: 'foo bar' },
    { expected: 'FooBar', input: '@fooBar' },
    { expected: 'FooBar', input: '$fooBar' },
    { expected: 'FooBar', input: '123fooBar' },
    {
      expected: 'NonAsciiÆøåÆøÅöôêÊ字符串',
      input: 'non-ascii-æøåÆØÅöôêÊ字符串',
    },
  ])('getServiceName($input) -> $expected', ({ input, expected }) => {
    expect(getServiceName(input)).toEqual(expected);
  });
});
