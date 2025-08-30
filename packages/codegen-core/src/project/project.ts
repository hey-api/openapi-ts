import { CodegenFile } from '../files/file';
import type { ICodegenImport } from '../imports/types';
import type { ICodegenMeta } from '../meta/types';
import type { ICodegenOutput } from '../output/types';
import type { ICodegenRenderer } from '../renderers/types';
import type { ICodegenSymbol } from '../symbols/types';
import type { ICodegenProject } from './types';

export class CodegenProject implements ICodegenProject {
  private filesMap: Map<string, CodegenFile> = new Map();
  private filesOrder: Array<CodegenFile> = [];
  private renderers: Map<string, ICodegenRenderer> = new Map();

  addExportToFile(fileOrPath: CodegenFile | string, imp: ICodegenImport): void {
    const file = this.ensureFile(fileOrPath);
    file.addExport(imp);
  }

  addImportToFile(fileOrPath: CodegenFile | string, imp: ICodegenImport): void {
    const file = this.ensureFile(fileOrPath);
    file.addImport(imp);
  }

  addSymbolToFile(
    fileOrPath: CodegenFile | string,
    symbol: ICodegenSymbol,
  ): void {
    const file = this.ensureFile(fileOrPath);
    file.addSymbol(symbol);
  }

  createFile(
    path: string,
    meta: Omit<CodegenFile['meta'], 'renderer'> & {
      /**
       * Renderer to use to render this file.
       */
      renderer?: ICodegenRenderer;
    } = {},
  ): CodegenFile {
    const { renderer, ...metadata } = meta;
    if (renderer) {
      this.ensureRenderer(renderer);
    }

    const existing = this.getFileByPath(path);
    if (existing) {
      // Whoever is creating the file will override the renderer
      if (renderer?.id && renderer.id !== existing.meta.renderer) {
        existing.meta.renderer = renderer.id;
      }
      return existing;
    }

    const file = new CodegenFile(path, {
      ...metadata,
      renderer: renderer?.id,
    });
    this.filesOrder.push(file);
    this.filesMap.set(path, file);
    return file;
  }

  ensureFile(fileOrPath: CodegenFile | string): CodegenFile {
    if (typeof fileOrPath !== 'string') {
      return fileOrPath;
    }
    const existingFile = this.getFileByPath(fileOrPath);
    if (existingFile) {
      return existingFile;
    }
    return this.createFile(fileOrPath);
  }

  private ensureRenderer(renderer: ICodegenRenderer): ICodegenRenderer {
    if (!this.renderers.has(renderer.id)) {
      this.renderers.set(renderer.id, renderer);
    }
    return this.renderers.get(renderer.id)!;
  }

  get files(): ReadonlyArray<CodegenFile> {
    return [...this.filesOrder];
  }

  getAllSymbols(): ReadonlyArray<ICodegenSymbol> {
    return this.filesOrder.flatMap((file) => file.getAllSymbols());
  }

  getFileByPath(path: string): CodegenFile | undefined {
    return this.filesMap.get(path);
  }

  render(meta?: ICodegenMeta): ReadonlyArray<ICodegenOutput> {
    const results: Array<ICodegenOutput> = [];
    for (const file of this.filesOrder) {
      if (!file.meta.renderer) continue;
      const renderer = this.renderers.get(file.meta.renderer);
      if (!renderer) continue;
      results.push(renderer.render(file, meta));
    }
    return results;
  }
}
