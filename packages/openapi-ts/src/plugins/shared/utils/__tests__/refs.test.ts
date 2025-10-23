import { describe, expect, it } from 'vitest';

import { fromRef, fromRefs, toRef, toRefs } from '../refs';

describe('toRef', () => {
  it('wraps a primitive value', () => {
    expect(toRef(42)).toEqual({ value: 42 });
    expect(toRef('x')).toEqual({ value: 'x' });
  });

  it('wraps an object', () => {
    const obj = { foo: 1 };
    expect(toRef(obj)).toEqual({ value: obj });
  });
});

describe('fromRef', () => {
  it('unwraps a primitive value', () => {
    expect(fromRef({ value: 42 })).toBe(42);
    expect(fromRef({ value: 'x' })).toBe('x');
  });

  it('unwraps an object', () => {
    const obj = { foo: 1 };
    expect(fromRef({ value: obj })).toBe(obj);
  });
});

describe('toRef <-> fromRef roundtrip', () => {
  it('roundtrips value -> ref -> value', () => {
    expect(fromRef(toRef(123))).toBe(123);
    const obj = { foo: 'bar' };
    expect(fromRef(toRef(obj))).toBe(obj);
  });
});

describe('toRefs', () => {
  it('wraps primitives', () => {
    expect(toRefs({ a: 1, b: 'x' })).toEqual({
      a: { value: 1 },
      b: { value: 'x' },
    });
  });

  it('wraps empty object', () => {
    expect(toRefs({})).toEqual({});
  });

  it('wraps nested objects shallowly', () => {
    const input = { a: { foo: 1 }, b: [1, 2] };
    const refs = toRefs(input);
    expect(refs.a.value).toEqual({ foo: 1 });
    expect(refs.b.value).toEqual([1, 2]);
  });
});

describe('fromRefs', () => {
  it('unwraps primitives', () => {
    expect(fromRefs({ a: { value: 1 }, b: { value: 'x' } })).toEqual({
      a: 1,
      b: 'x',
    });
  });

  it('unwraps empty object', () => {
    expect(fromRefs({})).toEqual({});
  });

  it('unwraps nested objects shallowly', () => {
    const input = { a: { value: { foo: 1 } }, b: { value: [1, 2] } };
    expect(fromRefs(input)).toEqual({ a: { foo: 1 }, b: [1, 2] });
  });
});

describe('toRefs <-> fromRefs roundtrip', () => {
  it('roundtrips plain -> refs -> plain', () => {
    const obj = { a: 1, b: 'x', c: [1, 2], d: { foo: 2 } };
    expect(fromRefs(toRefs(obj))).toEqual(obj);
  });

  it('roundtrips refs -> plain -> refs', () => {
    const refs = { a: { value: 1 }, b: { value: 'x' }, c: { value: [1, 2] } };
    expect(toRefs(fromRefs(refs))).toEqual(refs);
  });
});
