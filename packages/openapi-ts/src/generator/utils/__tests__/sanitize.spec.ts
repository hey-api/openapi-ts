import { describe, expect, it } from 'vitest';

import {
  ensureValidTypeScriptJavaScriptIdentifier,
  sanitizeNamespaceIdentifier,
  sanitizeOperationParameterName,
} from '../sanitize';

describe('sanitizeOperationParameterName', () => {
  it.each([
    { expected: 'abc', input: 'abc' },
    { expected: 'æbc', input: 'æbc' },
    { expected: 'æb-c', input: 'æb.c' },
    { expected: 'æb-c', input: '1æb.c' },
    { expected: 'unknownArray', input: 'unknown[]' },
  ])(
    'sanitizeOperationParameterName($input) -> $expected',
    ({ input, expected }) => {
      expect(sanitizeOperationParameterName(input)).toEqual(expected);
    },
  );
});

describe('sanitizeNamespaceIdentifier', () => {
  it.each([
    { expected: 'abc', input: 'abc' },
    { expected: 'æbc', input: 'æbc' },
    { expected: 'æb-c', input: 'æb.c' },
    { expected: 'æb-c', input: '1æb.c' },
    { expected: 'a-b-c--d--e', input: 'a/b{c}/d/$e' },
  ])(
    'sanitizeNamespaceIdentifier($input) -> $expected',
    ({ input, expected }) => {
      expect(sanitizeNamespaceIdentifier(input)).toEqual(expected);
    },
  );
});

describe('ensureValidTypeScriptJavaScriptIdentifier', () => {
  it.each([
    { expected: 'abc', input: 'abc' },
    { expected: 'æbc', input: 'æbc' },
    { expected: 'æb_c', input: 'æb.c' },
    { expected: '_1æb_c', input: '1æb.c' },
    { expected: '_400', input: '400' },
  ])(
    'ensureValidTypeScriptJavaScriptIdentifier($input) -> $expected',
    ({ input, expected }) => {
      expect(ensureValidTypeScriptJavaScriptIdentifier(input)).toEqual(
        expected,
      );
    },
  );
});
