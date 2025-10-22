import { describe, expect, it } from 'vitest';

import { MinHeap } from '../minHeap';

describe('MinHeap', () => {
  it('pops items in increasing declIndex order', () => {
    const idx = new Map<string, number>([
      ['a', 10],
      ['b', 5],
      ['c', 20],
    ]);
    const h = new MinHeap(idx);
    h.push('a');
    h.push('b');
    h.push('c');

    expect(h.pop()).toBe('b');
    expect(h.pop()).toBe('a');
    expect(h.pop()).toBe('c');
    expect(h.pop()).toBeUndefined();
  });

  it('supports interleaved push/pop and maintains order', () => {
    const idx = new Map<string, number>([
      ['x', 0],
      ['y', 1],
      ['z', 2],
    ]);
    const h = new MinHeap(idx);
    h.push('y');
    expect(h.pop()).toBe('y');

    h.push('z');
    h.push('x');
    expect(h.pop()).toBe('x');
    expect(h.pop()).toBe('z');
  });

  it('handles duplicates (same id pushed multiple times)', () => {
    const idx = new Map<string, number>([['dup', 1]]);
    const h = new MinHeap(idx);
    h.push('dup');
    h.push('dup');
    expect(h.pop()).toBe('dup');
    // second duplicate still present
    expect(h.pop()).toBe('dup');
    expect(h.pop()).toBeUndefined();
  });

  it('isEmpty returns true when empty and false when not', () => {
    const idx = new Map<string, number>([['a', 0]]);
    const h = new MinHeap(idx);
    expect(h.isEmpty()).toBe(true);
    h.push('a');
    expect(h.isEmpty()).toBe(false);
    h.pop();
    expect(h.isEmpty()).toBe(true);
  });
});
