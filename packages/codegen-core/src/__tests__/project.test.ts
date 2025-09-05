import { beforeEach, describe, expect, it } from 'vitest';

import { CodegenFile } from '../files/file';
import type { ICodegenMeta } from '../meta/types';
import type { ICodegenOutput } from '../output/types';
import { CodegenProject } from '../project/project';
import type { ICodegenRenderer } from '../renderers/types';

describe('CodegenProject', () => {
  let project: CodegenProject;

  beforeEach(() => {
    project = new CodegenProject();
  });

  it('adds new files and preserves order', () => {
    const file1 = project.createFile('a.ts');
    const file2 = project.createFile('b.ts');

    expect(project.files).toEqual([file1, file2]);
  });

  it('replaces existing file but keeps order', () => {
    project.createFile('a.ts');
    project.createFile('b.ts');
    project.createFile('c.ts');
    const newFile2 = project.createFile('b.ts');

    expect(project.files.length).toBe(3);
    expect(project.files[1]).toBe(newFile2);
    expect(project.getFileByPath('b.ts')).toBe(newFile2);
  });

  it('addExportToFile creates file if missing and adds export', () => {
    const imp = { from: 'lib', names: ['Foo'] };

    project.addExportToFile('a.ts', imp);

    const file = project.getFileByPath('a.ts')!;
    expect(file).toBeDefined();
    expect(file.exports.length).toBe(1);
    expect(file.exports[0]).toEqual(imp);
  });

  it('addImportToFile creates file if missing and adds import', () => {
    const imp = { from: 'lib', names: ['Foo'] };

    project.addImportToFile('a.ts', imp);

    const file = project.getFileByPath('a.ts')!;
    expect(file).toBeDefined();
    expect(file.imports.length).toBe(1);
    expect(file.imports[0]).toEqual(imp);
  });

  it('addSymbolToFile creates file if missing and adds symbol', () => {
    const symbol = { name: 'MySymbol', value: {} };

    project.addSymbolToFile('a.ts', symbol);

    const file = project.getFileByPath('a.ts')!;
    expect(file).toBeDefined();
    expect(file.symbols.length).toBe(1);
    expect(file.symbols[0]).toEqual({
      ...symbol,
      id: 0,
      placeholder: '_heyapi_0_',
    });
  });

  it('getAllSymbols returns all symbols from all files', () => {
    const file1 = project.createFile('a.ts');
    const file2 = project.createFile('b.ts');

    file1.addSymbol({ name: 'A', value: {} });
    file2.addSymbol({ name: 'B', value: {} });

    const symbols = project.getAllSymbols().map((s) => s.name);
    expect(symbols).toEqual(['A', 'B']);
  });

  it('getFileByPath returns undefined for unknown path', () => {
    expect(project.getFileByPath('unknown.ts')).toBeUndefined();
  });

  it('files getter returns a copy of the files array', () => {
    const file = project.createFile('a.ts');

    const files = project.files;
    expect(files).toEqual([file]);

    // @ts-expect-error
    // mutate returned array should not affect internal state
    files.push(new CodegenFile('b.ts', project));
    expect(project.files).toEqual([file]);
  });

  it('render returns output from all files', () => {
    class Renderer implements ICodegenRenderer {
      id = 'foo';
      render(file: CodegenFile, meta?: ICodegenMeta): ICodegenOutput {
        return {
          content: `content ${file.path}`,
          meta: { ...meta },
          path: file.path,
        };
      }
    }
    const renderer = new Renderer();
    const meta = { foo: 42 };
    project.createFile('a.ts', { renderer });
    project.createFile('b.ts', { renderer });

    const outputs = project.render(meta);
    expect(outputs).toEqual([
      { content: 'content a.ts', meta: { foo: 42 }, path: 'a.ts' },
      { content: 'content b.ts', meta: { foo: 42 }, path: 'b.ts' },
    ]);
  });

  it('createFile adds and returns a new file with optional meta', () => {
    const file = project.createFile('a.ts', { extension: '.ts' });

    expect(file.path).toBe('a.ts');
    expect(file.meta).toEqual({ extension: '.ts' });
    expect(project.getFileByPath('a.ts')).toBe(file);
    expect(project.files).toEqual([file]);
  });
});
