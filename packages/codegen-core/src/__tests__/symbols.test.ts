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

    // Register a symbol with selector
    const symbol1 = registry.register({
      placeholder: 'Foo',
      selector: ['foo'],
    });
    expect(symbol1).toEqual({
      exportFrom: [],
      id: expect.any(Number),
      placeholder: 'Foo',
      selector: ['foo'],
    });

    // get by id and selector
    expect(registry.get(symbol1.id)).toEqual(symbol1);
    expect(registry.get(['foo'])).toEqual(symbol1);

    // isRegistered should be true for explicitly registered symbols
    expect(registry.isRegistered(symbol1.id)).toBe(true);
    expect(registry.isRegistered(['foo'])).toBe(true);

    // Registering again with same selector returns same symbol
    const symbol1b = registry.register({ selector: ['foo'] });
    expect(symbol1b).toEqual(symbol1);

    // Registering with id returns same symbol
    const symbol1c = registry.register({ id: symbol1.id });
    expect(symbol1c).toEqual(symbol1);

    // Reference by id returns same symbol
    const ref1 = registry.reference(symbol1.id);
    expect(ref1).toEqual(symbol1);

    // Reference by selector returns same symbol
    const ref1b = registry.reference(['foo']);
    expect(ref1b).toEqual(symbol1);

    // Register a new symbol with a different selector
    const symbol2 = registry.register({
      exportFrom: ['x'],
      placeholder: 'Bar',
      selector: ['bar'],
    });
    expect(symbol2).toEqual({
      exportFrom: ['x'],
      id: expect.any(Number),
      placeholder: 'Bar',
      selector: ['bar'],
    });

    // Registering with same selector and extra exportFrom merges exportFrom
    const symbol2b = registry.register({
      exportFrom: ['y'],
      selector: ['bar'],
    });
    expect(symbol2b.exportFrom).toEqual(['x', 'y']);

    // Registered symbols are yielded in order
    const registered = Array.from(registry.registered());
    expect(registered).toEqual([
      expect.objectContaining({ selector: ['foo'] }),
      expect.objectContaining({ selector: ['bar'] }),
    ]);

    // setValue, getValue, hasValue
    expect(registry.hasValue(symbol1.id)).toBe(false);
    registry.setValue(symbol1.id, 42);
    expect(registry.hasValue(symbol1.id)).toBe(true);
    expect(registry.getValue(symbol1.id)).toBe(42);

    // referenced-only symbol should not be registered until register() with data
    const symRef = registry.reference(['qux']);
    expect(registry.isRegistered(symRef.id)).toBe(false);
    const symRegistered = registry.register({
      placeholder: 'Qux',
      selector: ['qux'],
    });
    expect(registry.isRegistered(symRegistered.id)).toBe(true);
  });

  it('throws on invalid register or reference', () => {
    const registry = new SymbolRegistry();
    // Register with id that does not exist
    expect(() => registry.register({ id: 9999 })).toThrow(
      'Symbol with ID 9999 not found. To register a new symbol, leave the ID undefined.',
    );
    // Register with selector that maps to missing id
    // Simulate by manually setting selectorToId
    registry['selectorToId'].set(JSON.stringify(['missing']), 42);
    expect(() => registry.register({ selector: ['missing'] })).toThrow(
      'Symbol with ID 42 not found. The selector ["missing"] matched an ID, but there was no result. This is likely an issue with the application logic.',
    );
  });
});
