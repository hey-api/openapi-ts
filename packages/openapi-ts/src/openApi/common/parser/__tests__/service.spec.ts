import { describe, expect, it } from 'vitest';

import { getServiceName, getServiceVersion } from '../service';

describe('getServiceVersion', () => {
    it.each([
        { input: '1.0', expected: '1.0' },
        { input: 'v1.2', expected: '1.2' },
        { input: 'V2.4', expected: '2.4' },
    ])('should get $expected when version is $input', ({ input, expected }) => {
        expect(getServiceVersion(input)).toEqual(expected);
    });
});

describe('getServiceName', () => {
    it.each([
        { input: '', expected: '' },
        { input: 'FooBar', expected: 'FooBar' },
        { input: 'Foo Bar', expected: 'FooBar' },
        { input: 'foo bar', expected: 'FooBar' },
        { input: '@fooBar', expected: 'FooBar' },
        { input: '$fooBar', expected: 'FooBar' },
        { input: '123fooBar', expected: 'FooBar' },
        { input: 'non-ascii-æøåÆØÅöôêÊ字符串', expected: 'NonAsciiÆøåÆøÅöôêÊ字符串' },
    ])('getServiceName($input) -> $expected', ({ input, expected }) => {
        expect(getServiceName(input)).toEqual(expected);
    });
});
