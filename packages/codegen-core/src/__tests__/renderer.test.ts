import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { replaceWrappedIds } from '../renderers/renderer';

describe('replaceWrappedIds', () => {
  it('replaces ids with names', () => {
    const source = fs.readFileSync(path.resolve(__dirname, 'file.ts'), {
      encoding: 'utf8',
    });

    const substitutions: Record<number, string> = {
      1: 'Foo',
      12: 'baz',
      2: 'bar',
      4: 'Bar',
      5: 'Foo',
    };

    const replaced = replaceWrappedIds(source, (id) => substitutions[id]);

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
