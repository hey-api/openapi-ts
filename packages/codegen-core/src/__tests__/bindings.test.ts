import { describe, expect, it } from 'vitest';

import type { IBiMap } from '../bimap/types';
import type { IBinding } from '../bindings/types';
import { createBinding, mergeBindings } from '../bindings/utils';
import type { ISymbolMeta } from '../extensions/types';
import type { IFileOut } from '../files/types';
import type { ISymbolOut } from '../symbols/types';

function makeBiMap(entries: [number, string][] = []): IBiMap<number, string> {
  const map = new Map<number, string>(entries);
  const reverse = new Map<string, number>(entries.map(([k, v]) => [v, k]));
  const bimap: IBiMap<number, string> = {
    delete: (key: number) => {
      const value = map.get(key);
      map.delete(key);
      if (value) reverse.delete(value);
      return true;
    },
    deleteValue: (value: string) => {
      const key = reverse.get(value);
      reverse.delete(value);
      if (key) map.delete(key);
      return true;
    },
    entries: () => map.entries(),
    get: (key: number) => map.get(key),
    getKey: (value: string) => reverse.get(value),
    hasKey: (key: number) => map.has(key),
    hasValue: (value: string) => reverse.has(value),
    keys() {
      return map.keys();
    },
    set: (key: number, value: string): IBiMap<number, string> => {
      map.set(key, value);
      reverse.set(value, key);
      return bimap;
    },
    size: 0,
    values() {
      return map.values();
    },
    [Symbol.iterator]() {
      return map[Symbol.iterator]();
    },
  };
  return bimap;
}

const makeFile = (
  resolvedNames: IBiMap<number, string> = makeBiMap(),
  id: number = 1,
): IFileOut => ({
  extension: 'ts',
  id,
  name: '',
  path: '',
  resolvedNames,
  selector: [],
  symbols: { body: [], exports: [], imports: [] },
});

const makeSymbol = (
  id: number,
  placeholder: string,
  meta: ISymbolMeta = {},
  name?: string,
): ISymbolOut => {
  const { importKind, kind, ...restMeta } = meta as any;
  return {
    id,
    importKind,
    kind,
    meta: restMeta,
    name,
    placeholder,
  } as any;
};

describe('createBinding', () => {
  it('creates a named binding by default', () => {
    const file = makeFile(makeBiMap([[1, 'Foo']]));
    const symbol = makeSymbol(
      1,
      'Foo',
      { importKind: 'named', kind: 'value' },
      'Foo',
    );
    const symbolFile = makeFile(makeBiMap([[1, 'Foo']]));
    const binding = createBinding({
      file,
      modulePath: './foo',
      symbol,
      symbolFile,
    });
    expect(binding).toEqual({
      aliases: {},
      from: './foo',
      names: ['Foo'],
      typeNames: [],
    });
  });

  it('creates a default binding', () => {
    const file = makeFile();
    const symbol = makeSymbol(
      2,
      'Bar',
      { importKind: 'default', kind: 'value' },
      'Bar',
    );
    const symbolFile = makeFile();
    const binding = createBinding({
      file,
      modulePath: './bar',
      symbol,
      symbolFile,
    });
    expect(binding).toEqual({
      aliases: {},
      defaultBinding: 'Bar',
      from: './bar',
      names: [],
      typeDefaultBinding: undefined,
      typeNames: [],
    });
  });

  it('creates a namespace binding', () => {
    const file = makeFile();
    const symbol = makeSymbol(
      3,
      'Baz',
      { importKind: 'namespace', kind: 'value' },
      'Baz',
    );
    const symbolFile = makeFile();
    const binding = createBinding({
      file,
      modulePath: './baz',
      symbol,
      symbolFile,
    });
    expect(binding).toEqual({
      aliases: {},
      from: './baz',
      names: [],
      namespaceBinding: 'Baz',
      typeNames: [],
      typeNamespaceBinding: undefined,
    });
  });

  it('creates type names for type symbols', () => {
    const file = makeFile(makeBiMap([[4, 'Qux']]));
    const symbol = makeSymbol(
      4,
      'Qux',
      { importKind: 'named', kind: 'type' },
      'Qux',
    );
    const symbolFile = makeFile(makeBiMap([[4, 'Qux']]));
    const binding = createBinding({
      file,
      modulePath: './qux',
      symbol,
      symbolFile,
    });
    expect(binding).toEqual({
      aliases: {},
      from: './qux',
      names: ['Qux'],
      typeNames: ['Qux'],
    });
  });
});

describe('mergeBindings', () => {
  it('merges aliases, names, and typeNames', () => {
    const target: IBinding = {
      aliases: { Foo: 'Bar' },
      from: './foo',
      names: ['Foo'],
      typeNames: ['Foo'],
    };
    const source: IBinding = {
      aliases: { Baz: 'Qux' },
      from: './foo',
      names: ['Baz'],
      typeNames: ['Baz'],
    };
    mergeBindings(target, source);
    expect(target).toEqual({
      aliases: { Baz: 'Qux', Foo: 'Bar' },
      from: './foo',
      names: ['Foo', 'Baz'],
      typeNames: ['Foo', 'Baz'],
    });
  });

  it('merges default and namespace bindings', () => {
    const target: IBinding = {
      aliases: {},
      from: './foo',
      names: [],
      typeNames: [],
    };
    const source: IBinding = {
      aliases: {},
      defaultBinding: 'Default',
      from: './foo',
      names: [],
      namespaceBinding: 'NS',
      typeDefaultBinding: true,
      typeNames: [],
      typeNamespaceBinding: true,
    };
    mergeBindings(target, source);
    expect(target).toEqual({
      aliases: {},
      defaultBinding: 'Default',
      from: './foo',
      names: [],
      namespaceBinding: 'NS',
      typeDefaultBinding: true,
      typeNames: [],
      typeNamespaceBinding: true,
    });
  });
});
