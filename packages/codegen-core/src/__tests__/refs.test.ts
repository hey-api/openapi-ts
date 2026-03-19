import { fromRef, fromRefs, ref, refs } from '../refs/refs';
import type { Refs } from '../refs/types';

describe('ref', () => {
  it('wraps a primitive value', () => {
    expect(ref(42)).toEqual({ '~ref': 42 });
    expect(ref('x')).toEqual({ '~ref': 'x' });
  });

  it('wraps an object', () => {
    const obj = { foo: 1 };
    expect(ref(obj)).toEqual({ '~ref': obj });
  });
});

describe('fromRef', () => {
  it('unwraps a primitive value', () => {
    expect(fromRef({ '~ref': 42 })).toBe(42);
    expect(fromRef({ '~ref': 'x' })).toBe('x');
  });

  it('unwraps an object', () => {
    const obj = { foo: 1 };
    expect(fromRef({ '~ref': obj })).toBe(obj);
  });
});

describe('ref <-> fromRef roundtrip', () => {
  it('roundtrips value -> ref -> value', () => {
    expect(fromRef(ref(123))).toBe(123);
    const obj = { foo: 'bar' };
    expect(fromRef(ref(obj))).toBe(obj);
  });
});

describe('refs', () => {
  it('wraps primitives', () => {
    expect(refs({ a: 1, b: 'x' })).toEqual({
      a: { '~ref': 1 },
      b: { '~ref': 'x' },
    });
  });

  it('wraps empty object', () => {
    expect(refs({})).toEqual({});
  });

  it('wraps nested objects shallowly', () => {
    const input = { a: { foo: 1 }, b: [1, 2] };
    const value = refs(input);
    expect(value.a['~ref']).toEqual({ foo: 1 });
    expect(value.b['~ref']).toEqual([1, 2]);
  });
});

describe('fromRefs', () => {
  it('unwraps primitives', () => {
    expect(fromRefs({ a: { '~ref': 1 }, b: { '~ref': 'x' } })).toEqual({
      a: 1,
      b: 'x',
    });
  });

  it('unwraps empty object', () => {
    expect(fromRefs({})).toEqual({});
  });

  it('unwraps nested objects shallowly', () => {
    const input: Refs<any> = {
      a: { '~ref': { foo: 1 } },
      b: { '~ref': [1, 2] },
    };
    expect(fromRefs(input)).toEqual({ a: { foo: 1 }, b: [1, 2] });
  });
});

describe('refs <-> fromRefs roundtrip', () => {
  it('roundtrips plain -> refs -> plain', () => {
    const obj = { a: 1, b: 'x', c: [1, 2], d: { foo: 2 } };
    expect(fromRefs(refs(obj))).toEqual(obj);
  });

  it('roundtrips refs -> plain -> refs', () => {
    const value: Refs<any> = {
      a: { '~ref': 1 },
      b: { '~ref': 'x' },
      c: { '~ref': [1, 2] },
    };
    expect(refs(fromRefs(value))).toEqual(value);
  });
});
