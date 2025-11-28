import { describe, expect, it } from 'vitest';

import { SymbolRegistry } from '../symbols/registry';
import { Symbol } from '../symbols/symbol';

const meta = (m: any) => m as any;

describe('SymbolRegistry', () => {
  it('register() assigns increasing IDs and stores symbols', () => {
    const r = new SymbolRegistry();

    const a = r.register({ meta: meta({ kind: 'x' }), name: 'A' });
    const b = r.register({ meta: meta({ kind: 'y' }), name: 'B' });

    expect(a.id).toBe(0);
    expect(b.id).toBe(1);
    expect(r.get(0)).toBe(a);
    expect(r.get(1)).toBe(b);
  });

  it('query() returns symbols matching meta', () => {
    const r = new SymbolRegistry();

    const a = r.register({
      meta: meta({ nested: { x: 1 }, type: 'foo' }),
      name: 'A',
    });
    r.register({ meta: meta({ type: 'bar' }), name: 'B' });

    const results = r.query(meta({ nested: { x: 1 }, type: 'foo' }));
    expect(results).toEqual([a]);
  });

  it('query() returns empty array when no matches', () => {
    const r = new SymbolRegistry();
    r.register({ meta: meta({ type: 'x' }), name: 'A' });

    expect(r.query(meta({ type: 'nope' }))).toEqual([]);
  });

  it('reference() returns stub if not registered', () => {
    const r = new SymbolRegistry();
    const stub = r.reference(meta({ id: 1, kind: 'x' }));

    expect(stub).toBeInstanceOf(Symbol);
    expect(r.isRegistered(stub.id)).toBe(false);

    // same meta → same stub
    const again = r.reference(meta({ id: 1, kind: 'x' }));
    expect(again).toBe(stub);
  });

  it('reference() stub is replaced when real symbol registers', () => {
    const r = new SymbolRegistry();

    const stub = r.reference(meta({ group: 'abc', tag: 1 }));
    const real = r.register({
      meta: meta({ group: 'abc', tag: 1 }),
      name: 'Real',
    });

    // Stub should now canonicalize to the real one
    expect(stub.canonical).toBe(real);
    expect(r.get(stub.id)).toBe(stub);

    // Queries should now return the real one
    expect(r.query(meta({ group: 'abc', tag: 1 }))).toEqual([real]);
  });

  it('isRegistered() returns true only for registered symbols', () => {
    const r = new SymbolRegistry();
    const stub = r.reference(meta({ foo: 1 }));
    const real = r.register({ meta: meta({ foo: 1 }), name: 'X' });

    expect(r.isRegistered(stub.id)).toBe(false);
    expect(r.isRegistered(real.id)).toBe(true);
  });

  it('registered() iterates over only registered symbols (not stubs)', () => {
    const r = new SymbolRegistry();
    r.reference(meta({ x: 1 })); // stub
    const a = r.register({ meta: meta({ x: 2 }), name: 'A' });
    const b = r.register({ meta: meta({ x: 3 }), name: 'B' });

    expect([...r.registered()]).toEqual([a, b]);
  });

  it('cache invalidates when new symbol matches cached query', () => {
    const r = new SymbolRegistry();

    // prime cache
    expect(r.query(meta({ type: 'foo' }))).toEqual([]);

    const a = r.register({ meta: meta({ type: 'foo' }), name: 'A' });

    // now query again → cache should be invalidated → return new entry
    expect(r.query(meta({ type: 'foo' }))).toEqual([a]);
  });

  it('nested meta keys are indexed correctly', () => {
    const r = new SymbolRegistry();

    const a = r.register({
      meta: meta({ a: { b: { c: 123 } } }),
      name: 'A',
    });

    const result = r.query(meta({ a: { b: { c: 123 } } }));
    expect(result).toEqual([a]);
  });
});
