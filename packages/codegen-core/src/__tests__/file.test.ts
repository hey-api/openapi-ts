import { beforeEach, describe, expect, it } from 'vitest';

import { CodegenFile } from '../files/file';
import type { ICodegenImport } from '../imports/types';
import { CodegenProject } from '../project/project';
import type { ICodegenSymbolIn } from '../symbols/types';

describe('CodegenFile', () => {
  let file: CodegenFile;
  let project: CodegenProject;

  beforeEach(() => {
    project = new CodegenProject();
    file = new CodegenFile('a.ts', project);
  });

  it('initializes with empty imports and symbols', () => {
    expect(file.imports).toEqual([]);
    expect(file.symbols).toEqual([]);
  });

  it('adds exports', () => {
    const exp1: ICodegenImport = { from: 'a' };
    const exp2: ICodegenImport = { from: 'b' };

    file.addExport(exp1);
    file.addExport(exp2);

    expect(file.exports.length).toBe(2);
    expect(file.exports[0]).not.toBe(exp1);
    expect(file.exports[0]).toEqual(exp1);
    expect(file.exports[1]).not.toBe(exp2);
    expect(file.exports[1]).toEqual(exp2);
  });

  it('merges duplicate exports', () => {
    const exp1: ICodegenImport = {
      aliases: {
        A: 'AliasA',
      },
      from: 'a',
      names: ['A'],
      typeNames: ['AType'],
    };
    const exp2: ICodegenImport = {
      aliases: {
        B: 'AliasB',
      },
      from: 'a',
      names: ['B'],
      typeNames: ['AType'],
    };

    file.addExport(exp1);
    file.addExport(exp2);

    expect(file.exports.length).toBe(1);
    expect(file.exports[0]).toEqual({
      aliases: {
        A: 'AliasA',
        B: 'AliasB',
      },
      from: 'a',
      names: ['A', 'AType', 'B'],
      typeNames: ['AType'],
    });
  });

  it('adds imports', () => {
    const imp1: ICodegenImport = { from: 'a' };
    const imp2: ICodegenImport = { from: 'b' };

    file.addImport(imp1);
    file.addImport(imp2);

    expect(file.imports.length).toBe(2);
    expect(file.imports[0]).not.toBe(imp1);
    expect(file.imports[0]).toEqual(imp1);
    expect(file.imports[1]).not.toBe(imp2);
    expect(file.imports[1]).toEqual(imp2);
  });

  it('merges duplicate imports', () => {
    const imp1: ICodegenImport = {
      aliases: {
        A: 'AliasA',
      },
      from: 'a',
      names: ['A'],
      typeNames: ['AType'],
    };
    const imp2: ICodegenImport = {
      aliases: {
        B: 'AliasB',
      },
      from: 'a',
      names: ['B'],
      typeNames: ['AType'],
    };

    file.addImport(imp1);
    file.addImport(imp2);

    expect(file.imports.length).toBe(1);
    expect(file.imports[0]).toEqual({
      aliases: {
        A: 'AliasA',
        B: 'AliasB',
      },
      from: 'a',
      names: ['A', 'AType', 'B'],
      typeNames: ['AType'],
    });
  });

  it('adds symbols', () => {
    const sym1: ICodegenSymbolIn = { name: 'a', value: 'a' };
    const sym2: ICodegenSymbolIn = { name: 'b', value: 'b' };
    const sym3: ICodegenSymbolIn = { headless: true, name: 'c' };

    file.addSymbol(sym1);
    file.addSymbol(sym2);
    file.addSymbol(sym3);

    expect(file.symbols.length).toBe(2);
    expect(file.symbols[0]).not.toBeUndefined();
    expect(file.symbols[0]).not.toBe(sym1);
    expect(file.symbols[0]).toMatchObject(sym1);
    expect(file.symbols[1]).not.toBeUndefined();
    expect(file.symbols[1]).not.toBe(sym2);
    expect(file.symbols[1]).toMatchObject(sym2);
  });

  it('updates symbols', () => {
    const sym1: ICodegenSymbolIn = {
      headless: true,
      name: 'a',
      value: 1,
    };
    const inserted = file.addSymbol(sym1);
    expect(file.symbols.length).toBe(0);

    const sym2: ICodegenSymbolIn = {
      headless: false,
      name: 'b',
      value: 'foo',
    };
    inserted.update(sym2);

    expect(file.symbols.length).toBe(1);
    expect(file.symbols[0]).toMatchObject({
      name: 'b',
      value: 'foo',
    });
  });

  it('getAllSymbols returns declared symbols plus imports and exports with alias applied', () => {
    file.addSymbol({ name: 'Local', value: {} });
    file.addImport({
      aliases: { A: 'AliasA' },
      from: 'lib',
      names: ['A', 'B'],
    });
    file.addExport({
      aliases: { C: 'AliasC' },
      from: 'lib',
      names: ['C', 'D'],
    });

    const all = file.getAllSymbols().map((s) => s.name);
    expect(all).toEqual(['Local', 'AliasA', 'B', 'AliasC', 'D']);
  });

  it('hasSymbol returns true if symbol exists', () => {
    const symbol = file.addSymbol({ name: 'Exists', value: {} });
    expect(file.hasSymbol(symbol.id)).toBe(true);
    expect(file.hasSymbol(-1)).toBe(false);
  });

  it('imports, exports, and symbols getters cache arrays and update after add', () => {
    expect(file.exports).toEqual([]);
    expect(file.imports).toEqual([]);
    expect(file.symbols).toEqual([]);

    const imp = { from: 'lib', names: ['X'] };
    const symbol = { name: 'Sym', value: {} };

    file.addExport(imp);
    expect(file.exports).toEqual([imp]);

    file.addImport(imp);
    expect(file.imports).toEqual([imp]);

    file.addSymbol(symbol);
    expect(file.symbols.length).toBe(1);
    expect(file.symbols[0]).toMatchObject(symbol);
  });

  it('returns relative path to another files', () => {
    const path1 = file.relativePathToFile({ path: 'b' });
    expect(path1).toBe('./b');

    const path2 = file.relativePathToFile({ path: './b' });
    expect(path2).toBe('./b');

    const path3 = file.relativePathToFile({ path: '../b' });
    expect(path3).toBe('../b');

    const path4 = file.relativePathToFile({ path: '../../b' });
    expect(path4).toBe('../../b');

    const path5 = file.relativePathToFile({ path: 'b/c' });
    expect(path5).toBe('./b/c');
  });

  it('returns relative path to this file', () => {
    const path1 = file.relativePathFromFile({ path: 'b' });
    expect(path1).toBe('./a.ts');

    const path2 = file.relativePathFromFile({ path: './b' });
    expect(path2).toBe('./a.ts');

    const path3 = file.relativePathFromFile({ path: '../b' });
    expect(path3).toBe('./codegen-core/a.ts');

    const path4 = file.relativePathFromFile({ path: '../../b' });
    expect(path4).toBe('./packages/codegen-core/a.ts');

    const path5 = file.relativePathFromFile({ path: 'b/c' });
    expect(path5).toBe('../a.ts');
  });
});
