import { describe, expect, it } from 'vitest';

import { TypeScriptRenderer } from '../renderer';

// Minimal local BiMap for tests
class LocalBiMap<Key, Value> {
  private map = new Map<Key, Value>();
  private reverse = new Map<Value, Key>();
  get(key: Key) {
    return this.map.get(key);
  }
  getKey(value: Value) {
    return this.reverse.get(value);
  }
  set(key: Key, value: Value) {
    this.map.set(key, value);
    this.reverse.set(value, key);
    return this;
  }
  hasValue(value: Value) {
    return this.reverse.has(value);
  }
}

describe('TypeScriptRenderer - Placeholder Replacement', () => {
  it('should replace placeholders in external symbol references', () => {
    const renderer = new TypeScriptRenderer();

    const symbolId = 1;
    const symbol = {
      external: 'zod',
      id: symbolId,
      kind: undefined,
      meta: { category: 'external', resource: 'zod.z' },
      name: 'z',
      placeholder: '_heyapi_1_',
    };

    const project = {
      symbolIdToFiles: () => [],
      symbols: new Map([[symbolId, symbol]]),
    } as any;

    const file: any = {
      resolvedNames: new LocalBiMap<number, string>(),
    };

    // Simulate rendering content with a placeholder
    const content = `export const schema = ${symbol.placeholder}.object({});`;

    // This is what renderFile does internally
    const processed = content.replace(/_heyapi_(\d+)_/g, (match) => {
      const id = Number.parseInt(match.slice('_heyapi_'.length, -1), 10);
      const sym = project.symbols.get(id);
      const result = renderer['replacerFn']({ file, project, symbol: sym });
      return result || match;
    });

    expect(processed).toBe('export const schema = z.object({});');
  });

  it('should handle stub symbols that are later registered', () => {
    const renderer = new TypeScriptRenderer();

    // First, create a stub (symbol without name)
    const stubId = 1;
    const stub = {
      exportFrom: [],
      external: 'zod',
      id: stubId,
      meta: { category: 'external', resource: 'zod.z' },
      placeholder: '_heyapi_1_',
      // Note: no 'name' property!
    };

    const project = {
      symbolIdToFiles: () => [],
      symbols: new Map([[stubId, stub]]),
    } as any;

    const file: any = {
      resolvedNames: new LocalBiMap<number, string>(),
    };

    // Try to replace placeholder with stub
    const result = renderer['replacerFn']({ file, project, symbol: stub });

    // With the fix: replacerFn now derives the name from the resource
    // even if stub.name is undefined
    expect(result).toBe('z');
  });

  it('should handle external symbols without names by using resource', () => {
    const renderer = new TypeScriptRenderer();

    const symbolId = 1;
    const symbol = {
      exportFrom: [],
      external: 'zod',
      id: symbolId,
      meta: { category: 'external', resource: 'zod.z' },
      placeholder: '_heyapi_1_',
      // Note: no 'name' property, but has 'external' and 'meta.resource'
    };

    const project = {
      symbolIdToFiles: () => [],
      symbols: new Map([[symbolId, symbol]]),
    } as any;

    const file: any = {
      resolvedNames: new LocalBiMap<number, string>(),
    };

    // This test documents the expected behavior:
    // When a symbol has no name but has external+resource, we should derive the name
    const result = renderer['replacerFn']({ file, project, symbol });

    // With the fix: derives the name from the resource 'zod.z' → 'z'
    expect(result).toBe('z');
  });
});
