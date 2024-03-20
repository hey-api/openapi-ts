import { describe, expect, it } from 'vitest';

import { escapeName, unescapeName } from '../escapeName';

const data = [
    ['', "''"],
    ['fooBar', 'fooBar'],
    ['Foo Bar', `'Foo Bar'`],
    ['foo bar', `'foo bar'`],
    ['foo-bar', `'foo-bar'`],
    ['foo.bar', `'foo.bar'`],
    ['foo_bar', 'foo_bar'],
    ['123foo.bar', `'123foo.bar'`],
    ['@foo.bar', `'@foo.bar'`],
    ['$foo.bar', `'$foo.bar'`],
    ['_foo.bar', `'_foo.bar'`],
    ['123foobar', `'123foobar'`],
    ['@foobar', `'@foobar'`],
    ['$foobar', '$foobar'],
    ['_foobar', '_foobar'],
];

describe('escapeName', () => {
    it('should escape', () => {
        data.forEach(([unescaped, escaped]) => {
            expect(escapeName(unescaped)).toBe(escaped);
        });
    });
});

describe('unescapeName', () => {
    it('should unescape', () => {
        data.forEach(([unescaped, escaped]) => {
            expect(unescapeName(escaped)).toBe(unescaped);
        });
    });
});
