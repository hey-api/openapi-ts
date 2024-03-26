import { describe, expect, it } from 'vitest';

import {
    sanitizeOperationName,
    sanitizeOperationParameterName,
    sanitizeServiceName,
    sanitizeTypeName,
} from '../sanitize';

describe('sanitizeOperationName', () => {
    it('should remove/replace illegal characters', () => {
        expect(sanitizeOperationName('abc')).toEqual('abc');
        expect(sanitizeOperationName('æbc')).toEqual('æbc');
        expect(sanitizeOperationName('æb.c')).toEqual('æb-c');
        expect(sanitizeOperationName('1æb.c')).toEqual('æb-c');
    });
});

describe('sanitizeOperationParameterName', () => {
    it('should remove/replace illegal characters', () => {
        expect(sanitizeOperationParameterName('abc')).toEqual('abc');
        expect(sanitizeOperationParameterName('æbc')).toEqual('æbc');
        expect(sanitizeOperationParameterName('æb.c')).toEqual('æb-c');
        expect(sanitizeOperationParameterName('1æb.c')).toEqual('æb-c');
        expect(sanitizeOperationParameterName('unknown[]')).toEqual('unknownArray');
    });
});

describe('sanitizeServiceName', () => {
    it('should remove/replace illegal characters', () => {
        expect(sanitizeServiceName('abc')).toEqual('abc');
        expect(sanitizeServiceName('æbc')).toEqual('æbc');
        expect(sanitizeServiceName('æb.c')).toEqual('æb-c');
        expect(sanitizeServiceName('1æb.c')).toEqual('æb-c');
    });
});

describe('sanitizeTypeName', () => {
    it('should remove/replace illegal characters', () => {
        expect(sanitizeTypeName('abc')).toEqual('abc');
        expect(sanitizeTypeName('æbc')).toEqual('æbc');
        expect(sanitizeTypeName('æb.c')).toEqual('æb_c');
        expect(sanitizeTypeName('1æb.c')).toEqual('æb_c');
    });
});

describe('sanitizeTypeName', () => {
    it('should remove/replace illegal characters', () => {
        expect(sanitizeTypeName('abc')).toEqual('abc');
        expect(sanitizeTypeName('æbc')).toEqual('æbc');
        expect(sanitizeTypeName('æb.c')).toEqual('æb_c');
        expect(sanitizeTypeName('1æb.c')).toEqual('æb_c');
    });
});
