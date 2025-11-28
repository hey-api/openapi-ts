import { describe, expect, it } from 'vitest';

import { BiMap } from '../bimap/bimap';

describe('BiMap', () => {
  it('covers the full public interface', () => {
    const bimap = new BiMap<number, string>();
    // set and get
    expect(bimap.set(1, 'a')).toBe(bimap);
    expect(bimap.set(2, 'b')).toBe(bimap);
    // get, getKeys
    expect(bimap.get(1)).toBe('a');
    expect(bimap.get(2)).toBe('b');
    expect(bimap.getKeys('a')).toEqual(new Set([1]));
    expect(bimap.getKeys('b')).toEqual(new Set([2]));
    // hasKey, hasValue
    expect(bimap.hasKey(1)).toBe(true);
    expect(bimap.hasKey(2)).toBe(true);
    expect(bimap.hasKey(3)).toBe(false);
    expect(bimap.hasValue('a')).toBe(true);
    expect(bimap.hasValue('b')).toBe(true);
    expect(bimap.hasValue('c')).toBe(false);
    // keys, values, entries
    expect(Array.from(bimap.keys())).toEqual([1, 2]);
    expect(Array.from(bimap.values())).toEqual(['a', 'b']);
    expect(Array.from(bimap.entries())).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
    // Symbol.iterator
    expect(Array.from(bimap)).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
    // size
    expect(bimap.size).toBe(2);
    // delete by key
    expect(bimap.delete(1)).toBe(true);
    expect(bimap.hasKey(1)).toBe(false);
    expect(bimap.hasValue('a')).toBe(false);
    // delete by value
    expect(bimap.deleteValue('b')).toBe(true);
    expect(bimap.hasKey(2)).toBe(false);
    expect(bimap.hasValue('b')).toBe(false);
    // After all deletes
    expect(bimap.size).toBe(0);
    // Setting again to check overwrite
    bimap.set(1, 'x');
    bimap.set(2, 'y');
    expect(bimap.get(1)).toBe('x');
    expect(bimap.get(2)).toBe('y');
    // Overwrite value for existing key
    bimap.set(1, 'z');
    expect(bimap.get(1)).toBe('z');
    expect(bimap.getKeys('z')).toEqual(new Set([1]));
    // Overwrite key for existing value
    bimap.set(3, 'z');
    expect(bimap.getKeys('z')).toEqual(new Set([1, 3]));
    expect(bimap.get(1)).toBe('z');
    // Iteration after overwrite
    expect(Array.from(bimap)).toEqual([
      [1, 'z'],
      [2, 'y'],
      [3, 'z'],
    ]);
  });
});
