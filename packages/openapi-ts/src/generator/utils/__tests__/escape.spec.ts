import { describe, expect, it } from 'vitest';

import { escapeName, unescapeName } from '../escape';

const toCheck: { escaped: string; unescaped: string }[] = [
  { escaped: "''", unescaped: '' },
  { escaped: 'fooBar', unescaped: 'fooBar' },
  { escaped: `'Foo Bar'`, unescaped: 'Foo Bar' },
  { escaped: `'foo bar'`, unescaped: 'foo bar' },
  { escaped: `'foo-bar'`, unescaped: 'foo-bar' },
  { escaped: `'foo.bar'`, unescaped: 'foo.bar' },
  { escaped: 'foo_bar', unescaped: 'foo_bar' },
  { escaped: `'123foo.bar'`, unescaped: '123foo.bar' },
  { escaped: `'@foo.bar'`, unescaped: '@foo.bar' },
  { escaped: `'$foo.bar'`, unescaped: '$foo.bar' },
  { escaped: `'_foo.bar'`, unescaped: '_foo.bar' },
  { escaped: `'123foobar'`, unescaped: '123foobar' },
  { escaped: `'@foobar'`, unescaped: '@foobar' },
  { escaped: '$foobar', unescaped: '$foobar' },
  { escaped: '_foobar', unescaped: '_foobar' },
];

describe('escapeName', () => {
  it.each(toCheck)(
    'should escape $unescaped to $escaped',
    ({ unescaped, escaped }) => {
      expect(escapeName(unescaped)).toBe(escaped);
    },
  );
});

describe('unescapeName', () => {
  it.each(toCheck)(
    'should unescape $escaped to $unescaped',
    ({ unescaped, escaped }) => {
      expect(unescapeName(escaped)).toBe(unescaped);
    },
  );
});
