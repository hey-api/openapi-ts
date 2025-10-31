import { describe, expect, it } from 'vitest';

import { SymbolRegistry } from '../symbols/registry';

describe('SymbolRegistry', () => {
  it('covers the full public interface', () => {
    const registry = new SymbolRegistry();
    // id property increments
    const id1 = registry.id;
    const id2 = registry.id;
    expect(typeof id1).toBe('number');
    expect(id2).toBe(id1 + 1);

    // Register a symbol with meta
    const symbol1 = registry.register({
      meta: {
        foo: 'bar',
      },
      placeholder: 'Foo',
    });
    expect(symbol1).toEqual({
      exportFrom: [],
      id: expect.any(Number),
      meta: {
        foo: 'bar',
      },
      placeholder: 'Foo',
    });

    // get by id and meta
    expect(registry.get(symbol1.id)).toEqual(symbol1);
    expect(registry.get({ foo: 'bar' })).toEqual(symbol1);

    // isRegistered should be true for explicitly registered symbols
    expect(registry.isRegistered(symbol1.id)).toBe(true);
    expect(registry.isRegistered({ foo: 'bar' })).toBe(true);

    // Registering again with same meta creates a new symbol
    const symbol1b = registry.register({ meta: { foo: 'bar' } });
    expect(symbol1b).not.toEqual(symbol1);

    // Registering with id overrides the symbol
    const symbol1c = registry.register({ id: symbol1.id });
    expect(symbol1c).not.toEqual(symbol1);
    expect(symbol1c.id).toBe(symbol1.id);

    // Reference returns same symbol
    const ref1 = registry.reference({ foo: 'bar' });
    expect(ref1).toEqual(symbol1c);

    // Register a new symbol with different meta
    const symbol2 = registry.register({
      exportFrom: ['x'],
      meta: { bar: 'baz' },
      placeholder: 'Bar',
    });
    expect(symbol2).toEqual({
      exportFrom: ['x'],
      id: expect.any(Number),
      meta: { bar: 'baz' },
      placeholder: 'Bar',
    });

    // Registered symbols are yielded in order
    const registered = Array.from(registry.registered());
    expect(registered).toEqual([
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ meta: { foo: 'bar' } }),
      expect.objectContaining({ meta: { bar: 'baz' } }),
    ]);

    // setValue, getValue, hasValue
    expect(registry.hasValue(symbol1.id)).toBe(false);
    registry.setValue(symbol1.id, 42);
    expect(registry.hasValue(symbol1.id)).toBe(true);
    expect(registry.getValue(symbol1.id)).toBe(42);

    // referenced-only symbol should not be registered until register()
    const symRef = registry.reference({ qux: true });
    expect(registry.isRegistered(symRef.id)).toBe(false);
    const symRegistered = registry.register({
      meta: { qux: true },
      placeholder: 'Qux',
    });
    expect(registry.isRegistered(symRegistered.id)).toBe(true);
  });

  it('indexes symbols and supports querying by meta', () => {
    const registry = new SymbolRegistry();

    // register a couple of symbols with meta
    const symA = registry.register({
      meta: { bar: 'type', foo: { bar: true } },
      name: 'A',
    });
    const symB = registry.register({
      meta: { bar: 'value', foo: { bar: false } },
      name: 'B',
    });

    // query by top-level meta key
    const types = registry.query({ bar: 'type' });
    expect(types).toEqual([symA]);

    // query by nested meta key
    const nestedTrue = registry.query({ foo: { bar: true } });
    expect(nestedTrue).toEqual([symA]);

    const nestedFalse = registry.query({ foo: { bar: false } });
    expect(nestedFalse).toEqual([symB]);
  });

  it('replaces stubs after registering', () => {
    const registry = new SymbolRegistry();

    const refA = registry.reference({ a: 0 });
    const refAB = registry.reference({ a: 0, b: 0 });
    const refB = registry.reference({ b: -1 });
    const symC = registry.register({
      meta: { a: 0, b: 0, c: 0 },
      name: 'C',
    });
    const refAD = registry.reference({ a: 0, d: 0 });
    const refAC = registry.reference({ a: 0, c: 0 });

    expect(symC).toEqual(refA);
    expect(symC).toEqual(refAB);
    expect(symC).toEqual(refAC);
    expect(symC).not.toEqual(refAD);
    expect(symC).not.toEqual(refB);
    expect(symC.meta).toEqual({ a: 0, b: 0, c: 0 });
  });

  it('caches query results and invalidates on relevant updates', () => {
    const registry = new SymbolRegistry();
    const symA = registry.register({ meta: { foo: 'bar' }, name: 'A' });

    // first query populates cache
    const result1 = registry.query({ foo: 'bar' });
    expect(result1).toEqual([symA]);
    expect(registry['queryCache'].size).toBe(1);

    // same query should hit cache, no change in cache size
    const result2 = registry.query({ foo: 'bar' });
    expect(result2).toEqual([symA]);
    expect(registry['queryCache'].size).toBe(1);

    // register another symbol with matching key should invalidate cache
    registry.register({ meta: { foo: 'bar' }, name: 'B' });
    expect(registry['queryCache'].size).toBe(0);

    // new query repopulates cache
    const result3 = registry.query({ foo: 'bar' });
    expect(result3.map((r) => r.name).sort()).toEqual(['A', 'B']);
    expect(registry['queryCache'].size).toBe(1);
  });

  it('invalidates only affected cache entries', () => {
    const registry = new SymbolRegistry();
    const symA = registry.register({ meta: { foo: 'bar' }, name: 'A' });
    const symX = registry.register({ meta: { x: 'y' }, name: 'X' });

    // Seed multiple cache entries
    const resultFoo = registry.query({ foo: 'bar' });
    const resultX = registry.query({ x: 'y' });
    expect(resultFoo).toEqual([symA]);
    expect(resultX).toEqual([symX]);
    const initialCacheKeys = Array.from(registry['queryCache'].keys());
    expect(initialCacheKeys.length).toBe(2);

    // Add new symbol that should only affect foo:bar queries
    registry.register({ meta: { foo: 'bar' }, name: 'B' });

    // Cache entry for foo:bar should be invalidated, x:y should remain
    const cacheKeysAfter = Array.from(registry['queryCache'].keys());
    expect(cacheKeysAfter.length).toBe(1);
    const remainingKey = cacheKeysAfter[0];
    expect(remainingKey).toBe(
      initialCacheKeys.find((k) => k.includes('x:"y"')),
    );

    // Query foo:bar again to repopulate it
    const resultFoo2 = registry.query({ foo: 'bar' });
    expect(resultFoo2.map((r) => r.name).sort()).toEqual(['A', 'B']);
    expect(registry['queryCache'].size).toBe(2);
  });

  it('caches empty results across all early exit paths', () => {
    const registry = new SymbolRegistry();

    // 1. Key doesn't exist in indices
    const resNoKey = registry.query({ foo: 'bar' });
    expect(resNoKey).toEqual([]);
    const cacheKeys1 = Array.from(registry['queryCache'].keys());
    expect(cacheKeys1.length).toBe(1);
    expect(registry['queryCache'].get(cacheKeys1[0]!)).toEqual([]);

    // 2. Key exists but value doesn't
    // Insert symbol with unrelated meta
    registry.register({ meta: { something: 'else' }, name: 'A' });
    const resNoValue = registry.query({ bar: 'baz' });
    expect(resNoValue).toEqual([]);
    const cacheKeys2 = Array.from(registry['queryCache'].keys());
    expect(cacheKeys2.length).toBe(2);
    expect(registry['queryCache'].get(cacheKeys2[1]!)).toEqual([]);

    // 3. Empty indexKeySpace (empty meta object)
    const resEmpty = registry.query({});
    expect(resEmpty).toEqual([]);
    const cacheKeys3 = Array.from(registry['queryCache'].keys());
    expect(cacheKeys3.length).toBe(3);
    expect(registry['queryCache'].get(cacheKeys3[2]!)).toEqual([]);
  });

  it('returns the same stub reference for identical unresolved meta', () => {
    const registry = new SymbolRegistry();

    const stubA1 = registry.reference({ a: 1 });
    const stubA2 = registry.reference({ a: 1 });

    // Same reference, not new instance
    expect(stubA1).toBe(stubA2);

    // Cache entry created by the internal query call
    const cacheKey = registry['buildCacheKey']({ a: 1 });
    expect(registry['queryCache'].has(cacheKey)).toBe(true);
    expect(registry['queryCache'].get(cacheKey)).toEqual([]);
  });

  it('demonstrates stub addition does not invalidate unrelated cache', () => {
    const registry = new SymbolRegistry();

    // Create one indexed symbol and one query to seed cache
    const symA = registry.register({ meta: { foo: 'bar' }, name: 'A' });
    const resultFoo = registry.query({ foo: 'bar' });
    expect(resultFoo).toEqual([symA]);
    const cacheKeysBefore = Array.from(registry['queryCache'].keys());
    expect(cacheKeysBefore.length).toBe(1);

    // Add unrelated stub (its meta triggers its own query)
    const stub = registry.reference({ something: 'else' });
    expect(stub.meta).toEqual({ something: 'else' });

    // Existing cache entry still present, plus one new entry for stub
    const cacheKeysAfter = Array.from(registry['queryCache'].keys());
    expect(cacheKeysAfter.length).toBe(cacheKeysBefore.length + 1);
    expect(cacheKeysAfter).toEqual(expect.arrayContaining(cacheKeysBefore));

    // The new stub isn't indexed, so query returns nothing yet
    const newQuery = registry.query({ something: 'else' });
    expect(newQuery).toEqual([]);
  });
});
