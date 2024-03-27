import { describe, expect, it } from 'vitest';

import {
    sanitizeOperationName,
    sanitizeOperationParameterName,
    sanitizeServiceName,
    sanitizeTypeName,
} from '../sanitize';

describe('sanitizeOperationName', () => {
    it.each([
        { input: 'abc', expected: 'abc' },
        { input: 'æbc', expected: 'æbc' },
        { input: 'æb.c', expected: 'æb-c' },
        { input: '1æb.c', expected: 'æb-c' },
    ])('sanitizeOperationName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeOperationName(input)).toEqual(expected);
    });
});

describe('sanitizeOperationParameterName', () => {
    it.each([
        { input: 'abc', expected: 'abc' },
        { input: 'æbc', expected: 'æbc' },
        { input: 'æb.c', expected: 'æb-c' },
        { input: '1æb.c', expected: 'æb-c' },
        { input: 'unknown[]', expected: 'unknownArray' },
    ])('sanitizeOperationParameterName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeOperationParameterName(input)).toEqual(expected);
    });
});

describe('sanitizeServiceName', () => {
    it.each([
        { input: 'abc', expected: 'abc' },
        { input: 'æbc', expected: 'æbc' },
        { input: 'æb.c', expected: 'æb-c' },
        { input: '1æb.c', expected: 'æb-c' },
    ])('sanitizeServiceName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeServiceName(input)).toEqual(expected);
    });
});

describe('sanitizeTypeName', () => {
    it.each([
        { input: 'abc', expected: 'abc' },
        { input: 'æbc', expected: 'æbc' },
        { input: 'æb.c', expected: 'æb_c' },
        { input: '1æb.c', expected: 'æb_c' },
    ])('sanitizeTypeName($input) -> $expected', ({ input, expected }) => {
        expect(sanitizeTypeName(input)).toEqual(expected);
    });
});
