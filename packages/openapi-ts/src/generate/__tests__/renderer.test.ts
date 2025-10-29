import { describe, expect, it } from 'vitest';

import { TypeScriptRenderer } from '../renderer';

// Minimal local BiMap for tests to avoid importing runtime-only class
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

describe('TypeScriptRenderer', () => {
  describe('default import placeholder replacement', () => {
    it('should replace placeholders in default imports correctly', () => {
      const renderer = new TypeScriptRenderer();

      // Create a mock project with symbols that have placeholders
      const project = {
        symbolIdToFiles: () => [],
        symbols: new Map(),
      } as any;

      // Create a symbol with a placeholder
      const symbolId = 95;
      const symbol = {
        id: symbolId,
        name: 'foo',
        placeholder: '_heyapi_95_',
      };
      project.symbols.set(symbolId, symbol);

      // Create a mock file
      const file = {
        resolvedNames: new Map([[symbolId, 'foo']]),
      } as any;

      // Create bindings with a default import that has a placeholder
      const bindings = new Map();
      bindings.set('foo', {
        aliases: {},
        defaultBinding: '_heyapi_95_', // Contains placeholder that should be replaced
        from: 'foo',
        names: [],
        typeNames: [],
      });

      // Generate import lines
      const importLines = renderer['getImportLines'](bindings, file, project);

      // The import should use 'foo' not '_heyapi_95_'
      expect(importLines).toEqual(["import foo from 'foo';"]);
    });
  });

  describe('replacer duplicate name handling', () => {
    it('allows duplicate names when kinds differ (type vs value)', () => {
      const renderer = new TypeScriptRenderer();

      // Prepare a mock file and project
      const file: any = {
        resolvedNames: new LocalBiMap<number, string>(),
        symbols: { body: [], exports: [], imports: [] },
      };

      const project = {
        symbolIdToFiles: () => [file],
        symbols: new Map(),
      } as any;

      // Two symbols with the same name but different kinds
      const typeSymbolId = 1;
      const valueSymbolId = 2;

      const typeSymbol: any = {
        exportFrom: [],
        id: typeSymbolId,
        kind: 'type',
        meta: {},
        name: 'Foo',
        placeholder: '_heyapi_1_',
      };
      const valueSymbol: any = {
        exportFrom: [],
        id: valueSymbolId,
        meta: {},
        name: 'Foo',
        placeholder: '_heyapi_2_',
      };

      project.symbols.set(typeSymbolId, typeSymbol);
      project.symbols.set(valueSymbolId, valueSymbol);

      // First replacement should register the name 'Foo'
      const first = renderer['replacerFn']({
        file,
        project,
        symbol: typeSymbol,
      });
      expect(first).toEqual('Foo');

      // Second replacement (different kind) should be allowed to also use 'Foo'
      const second = renderer['replacerFn']({
        file,
        project,
        symbol: valueSymbol,
      });
      expect(second).toEqual('Foo');
    });
  });
});
