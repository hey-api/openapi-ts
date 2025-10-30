import { describe, expect, it } from 'vitest';

import type { IFileOut } from '../files/types';
import { Project } from '../project/project';
import type { IRenderer } from '../renderer/types';

describe('Project', () => {
  it('covers the full public interface', () => {
    const renderer: IRenderer = {
      renderFile: (content: string) => `RENDERED:${content}`,
      renderSymbols: (file: IFileOut) => `SYMBOLS:${file.name}`,
    };
    const project = new Project({
      defaultFileName: 'main',
      renderers: { '.ts': renderer },
      root: '/root',
    });

    // Registries are defined
    expect(project.files).toBeDefined();
    expect(project.symbols).toBeDefined();

    // Add a symbol and render output
    const symbol = project.symbols.register({
      getFilePath: () => 'foo',
      meta: { foo: 'bar' },
      placeholder: 'Foo',
    });
    // Add a renderer for .ts files
    // Simulate a file with .ts extension
    project.files.register({
      extension: '.ts',
      name: 'foo',
      path: '/root/foo.ts',
      selector: ['foo'],
    });
    // Render output
    const outputs = project.render();
    expect(Array.isArray(outputs)).toBe(true);
    expect(outputs.length).toBe(1);
    expect(outputs).toEqual([
      {
        content: 'RENDERED:SYMBOLS:foo',
        path: '/root/foo.ts',
      },
    ]);

    // symbolIdToFiles returns correct files
    const filesForSymbol = project.symbolIdToFiles(symbol.id);
    expect(filesForSymbol.length).toBeGreaterThan(0);
    expect(filesForSymbol[0]?.name).toBe('foo');
  });

  it('skips files with no renderer or external', () => {
    const project = new Project({
      defaultFileName: 'main',
      renderers: {},
      root: '/root',
    });
    // Register a file with no extension
    project.files.register({ name: 'noext', selector: ['noext'] });
    // Register an external file
    project.files.register({ external: true, name: 'ext', selector: ['ext'] });
    // Should not throw, but output should be empty
    const outputs = project.render();
    expect(outputs).toEqual([]);
  });

  it('respects fileName override', () => {
    const renderer: IRenderer = {
      renderFile: (content: string) => content,
      renderSymbols: (file: IFileOut) => `SYMBOLS:${file.name}`,
    };
    const project = new Project({
      defaultFileName: 'main',
      fileName: (name) => `X_${name}`,
      renderers: { '.ts': renderer },
      root: '/root',
    });
    // Register a symbol with selector
    project.symbols.register({
      getFilePath: () => 'bar',
      meta: { bar: 'baz' },
      placeholder: 'Bar',
    });
    // Render output (should use fileName override)
    const outputs = project.render();
    expect(outputs[0]?.path).toContain('X_bar');
  });
});
