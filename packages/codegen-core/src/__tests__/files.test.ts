import { describe, expect, it } from 'vitest';

import { FileRegistry } from '../files/registry';

describe('FileRegistry', () => {
  it('covers the full public interface', () => {
    const registry = new FileRegistry();
    // id property increments
    const id1 = registry.id;
    const id2 = registry.id;
    expect(typeof id1).toBe('number');
    expect(id2).toBe(id1 + 1);

    // Register a file with selector
    const file1 = registry.register({ name: 'Foo', selector: ['foo'] });
    expect(file1).toEqual({
      extension: undefined,
      external: undefined,
      id: expect.any(Number),
      localNames: new Set(),
      name: 'Foo',
      path: undefined,
      resolvedNames: expect.any(Object),
      selector: ['foo'],
      symbols: { body: [], exports: [], imports: [] },
    });

    // get by id and selector
    expect(registry.get(file1.id)).toEqual(file1);
    expect(registry.get(['foo'])).toEqual(file1);

    // isRegistered should be true for explicitly registered files
    expect(registry.isRegistered(file1.id)).toBe(true);
    expect(registry.isRegistered(['foo'])).toBe(true);

    // Registering again with same selector returns same file
    const file1b = registry.register({ selector: ['foo'] });
    expect(file1b).toEqual(file1);

    // Registering with id returns same file
    const file1c = registry.register({ id: file1.id });
    expect(file1c).toEqual(file1);

    // Reference by id returns same file
    const ref1 = registry.reference(file1.id);
    expect(ref1).toEqual(file1);

    // Reference by selector returns same file
    const ref1b = registry.reference(['foo']);
    expect(ref1b).toEqual(file1);

    // Register a new file with a different selector
    const file2 = registry.register({
      name: 'Bar',
      path: '/bar',
      selector: ['bar'],
    });
    expect(file2).toEqual({
      extension: undefined,
      external: undefined,
      id: expect.any(Number),
      localNames: new Set(),
      name: 'Bar',
      path: '/bar',
      resolvedNames: expect.any(Object),
      selector: ['bar'],
      symbols: { body: [], exports: [], imports: [] },
    });

    // Registered files are yielded in order
    const registered = Array.from(registry.registered());
    expect(registered).toEqual([
      expect.objectContaining({ selector: ['foo'] }),
      expect.objectContaining({ selector: ['bar'] }),
    ]);

    // Referenced files are yielded in order
    // Only files referenced but not registered are included
    // Reference a new file (not registered)
    const file3 = registry.reference(['baz']);
    const referenced = Array.from(registry.referenced());
    expect(referenced).toContainEqual(file3);
    // Once registered, file1 is not in referenced set
    expect(referenced).not.toContainEqual(file1);

    // Referenced-only file should not be considered registered
    expect(registry.isRegistered(file3.id)).toBe(false);
    // Once registered, file3 becomes registered and no longer appears in referenced()
    const file3Registered = registry.register({
      name: 'Baz',
      selector: ['baz'],
    });
    expect(registry.isRegistered(file3Registered.id)).toBe(true);
    const referencedAfter = Array.from(registry.referenced());
    expect(referencedAfter).not.toContainEqual(file3Registered);
  });

  it('throws on invalid register or reference', () => {
    const registry = new FileRegistry();
    // Register with id that does not exist
    expect(() => registry.register({ id: 9999 })).toThrow(
      'File with ID 9999 not found. To register a new file, leave the ID undefined.',
    );
    // Register with selector that maps to missing id
    // Simulate by manually setting selectorToId
    registry['selectorToId'].set(JSON.stringify(['missing']), 42);
    expect(() => registry.register({ selector: ['missing'] })).toThrow(
      'File with ID 42 not found. The selector ["missing"] matched an ID, but there was no result. This is likely an issue with the application logic.',
    );
  });
});
