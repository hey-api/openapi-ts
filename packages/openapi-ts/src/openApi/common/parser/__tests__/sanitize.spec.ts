import { describe, expect, it } from 'vitest';

import {
    sanitizeOperationName,
    sanitizeOperationParameterName,
    sanitizeServiceName,
    sanitizeTypeName,
} from '../sanitize';

describe('sanitizeOperationName', () => {
    it.each([
        { expected: 'abc', input: 'abc' },
        { expected: 'æbc', input: 'æbc' },
        { expected: 'æb-c', input: 'æb.c' },
        { expected: 'æb-c', input: '1æb.c' },
    ])('sanitizeOperationName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeOperationName(input)).toEqual(expected);
    });
});

describe('sanitizeOperationParameterName', () => {
    it.each([
        { expected: 'abc', input: 'abc' },
        { expected: 'æbc', input: 'æbc' },
        { expected: 'æb-c', input: 'æb.c' },
        { expected: 'æb-c', input: '1æb.c' },
        { expected: 'unknownArray', input: 'unknown[]' },
    ])('sanitizeOperationParameterName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeOperationParameterName(input)).toEqual(expected);
    });
});

describe('sanitizeServiceName', () => {
    it.each([
        { expected: 'abc', input: 'abc' },
        { expected: 'æbc', input: 'æbc' },
        { expected: 'æb-c', input: 'æb.c' },
        { expected: 'æb-c', input: '1æb.c' },
    ])('sanitizeServiceName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeServiceName(input)).toEqual(expected);
    });
});

describe('sanitizeTypeName', () => {
    it.each([
        { expected: 'abc', input: 'abc' },
        { expected: 'æbc', input: 'æbc' },
        { expected: 'æb_c', input: 'æb.c' },
        { expected: 'æb_c', input: '1æb.c' },
    ])('sanitizeTypeName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeTypeName(input)).toEqual(expected);
    });
});
