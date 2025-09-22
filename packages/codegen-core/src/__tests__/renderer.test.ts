import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { renderIds, wrapId } from '../renderer/utils';

describe('renderIds', () => {
  it('replaces ids with names', () => {
    const source = fs.readFileSync(path.resolve(__dirname, 'data', 'file.ts'), {
      encoding: 'utf8',
    });

    const substitutions: Record<number, string> = {
      1: 'Foo',
      12: 'baz',
      2: 'bar',
      4: 'Bar',
      5: 'Foo',
    };

    const replaced = renderIds(source, (id) => substitutions[id]);

    expect(replaced).toEqual(`/* @ts-nocheck */

type Foo = string;
type Bar = () => Foo;

/**
 * something about Foo. Did you know that _Foo_?
 */
export class Foo {
  // Foo is great!
  bar(baz: ReturnType<Bar>): Foo {
    return baz;
  }
}
`);
  });
});

describe('wrapId', () => {
  it('wraps id in the expected format', () => {
    expect(wrapId(String(42))).toBe('_heyapi_42_');
    expect(wrapId(String(0))).toBe('_heyapi_0_');
    expect(wrapId(String(123456))).toBe('_heyapi_123456_');
    expect(wrapId('foo')).toBe('_heyapi_foo_');
  });
});
