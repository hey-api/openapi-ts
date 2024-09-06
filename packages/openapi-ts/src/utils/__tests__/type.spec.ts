import { describe, expect, it, type MockedFunction, vi } from 'vitest';

import type { Config } from '../../types/config';
import { isStandaloneClient } from '../config';
import { transformTypeKeyName } from '../type';

vi.mock('../config', () => {
  const config: Partial<Config> = {
    types: {},
  };
  return {
    getConfig: () => config,
    isStandaloneClient: vi.fn().mockReturnValue(false),
  };
});

describe('transformTypeKeyName', () => {
  describe('legacy client', () => {
    it.each([
      { expected: '', input: '' },
      { expected: 'foobar', input: 'foobar' },
      { expected: 'fooBar', input: 'fooBar' },
      { expected: 'fooBar', input: 'foo_bar' },
      { expected: 'fooBar', input: 'foo-bar' },
      { expected: 'fooBar', input: 'foo.bar' },
      { expected: 'fooBar', input: '@foo.bar' },
      { expected: 'fooBar', input: '$foo.bar' },
      { expected: 'fooBar', input: '123.foo.bar' },
      { expected: 'fooBar', input: 'Foo-Bar' },
      { expected: 'fooBar', input: 'FOO-BAR' },
      { expected: 'fooBar', input: 'foo[bar]' },
      { expected: 'fooBarArray', input: 'foo.bar[]' },
    ])('$input -> $expected', ({ input, expected }) => {
      (isStandaloneClient as MockedFunction<any>).mockImplementationOnce(
        () => false,
      );
      expect(transformTypeKeyName(input)).toBe(expected);
    });
  });

  describe('standalone client', () => {
    it.each([
      { expected: '', input: '' },
      { expected: 'foobar', input: 'foobar' },
      { expected: 'fooBar', input: 'fooBar' },
      { expected: 'fooBar', input: 'foo_bar' },
      { expected: 'fooBar', input: 'foo-bar' },
      { expected: 'fooBar', input: 'foo.bar' },
      { expected: 'fooBar', input: '@foo.bar' },
      { expected: 'fooBar', input: '$foo.bar' },
      { expected: 'fooBar', input: '123.foo.bar' },
      { expected: 'fooBar', input: 'Foo-Bar' },
      { expected: 'fooBar', input: 'FOO-BAR' },
      { expected: 'fooBar', input: 'foo[bar]' },
      { expected: 'fooBarArray', input: 'foo.bar[]' },
    ])('$input -> $input', ({ input }) => {
      (isStandaloneClient as MockedFunction<any>).mockImplementationOnce(
        () => true,
      );
      expect(transformTypeKeyName(input)).toBe(input);
    });
  });
});
