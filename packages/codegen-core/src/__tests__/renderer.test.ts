import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { replacePlaceholders } from '../renderers/renderer';

describe('replacePlaceholders', () => {
  it('replaces ids with names', () => {
    const source = fs.readFileSync(path.resolve(__dirname, 'file.ts'), {
      encoding: 'utf8',
    });

    const substitutions: Record<string, string> = {
      _heyapi_12_: 'baz',
      _heyapi_1_: 'Foo',
      _heyapi_2_: 'bar',
      _heyapi_4_: '() => string',
      _heyapi_5_: 'string',
    };

    const replaced = replacePlaceholders({
      source,
      substitutions,
    });

    expect(replaced).toEqual(`/* @ts-nocheck */

/**
 * something about Foo. Did you know that _Foo_?
 */
export class Foo {
  // Foo is great!
  bar(baz: ReturnType<() => string>): string {
    return baz;
  }
}
`);
  });
});
