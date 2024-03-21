import { describe, expect, it } from 'vitest';

import { escapeName, unescapeName } from '../escapeName';

const toCheck: { unescaped: string; escaped: string }[] = [
    { unescaped: '', escaped: "''" },
    { unescaped: 'fooBar', escaped: 'fooBar' },
    { unescaped: 'Foo Bar', escaped: `'Foo Bar'` },
    { unescaped: 'foo bar', escaped: `'foo bar'` },
    { unescaped: 'foo-bar', escaped: `'foo-bar'` },
    { unescaped: 'foo.bar', escaped: `'foo.bar'` },
    { unescaped: 'foo_bar', escaped: 'foo_bar' },
    { unescaped: '123foo.bar', escaped: `'123foo.bar'` },
    { unescaped: '@foo.bar', escaped: `'@foo.bar'` },
    { unescaped: '$foo.bar', escaped: `'$foo.bar'` },
    { unescaped: '_foo.bar', escaped: `'_foo.bar'` },
    { unescaped: '123foobar', escaped: `'123foobar'` },
    { unescaped: '@foobar', escaped: `'@foobar'` },
    { unescaped: '$foobar', escaped: '$foobar' },
    { unescaped: '_foobar', escaped: '_foobar' },
];

describe('escapeName', () => {
    it.each(toCheck)('should escape $unescaped to $escaped', ({ unescaped, escaped }) => {
        expect(escapeName(unescaped)).toBe(escaped);
    });
});

describe('unescapeName', () => {
    it.each(toCheck)('should unescape $escaped to $unescaped', ({ unescaped, escaped }) => {
        expect(unescapeName(escaped)).toBe(unescaped);
    });
});
