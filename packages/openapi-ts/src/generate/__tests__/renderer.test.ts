import { describe, expect, it } from 'vitest';

import { TypeScriptRenderer } from '../renderer';

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
});
