import { CodegenFile } from '../files/file';
import type { ICodegenFile } from '../files/types';
import type { ICodegenImport } from '../imports/types';
import type { ICodegenMeta } from '../meta/types';
import type { ICodegenOutput } from '../output/types';
import { replaceWrappedIds } from '../renderers/renderer';
import type { ICodegenRenderer } from '../renderers/types';
import type {
  ICodegenSymbolIn,
  ICodegenSymbolOut,
  ICodegenSymbolSelector,
} from '../symbols/types';
import type { ICodegenProject } from './types';

export class CodegenProject implements ICodegenProject {
  private fileId: number = 0;
  private fileIdToFile: Map<number, ICodegenFile> = new Map();
  private fileOrder: Array<ICodegenFile> = [];
  private filePathToFileId: Map<string, number> = new Map();
  private renderers: Map<string, ICodegenRenderer> = new Map();
  private selectorToSymbolIds: Map<string, Array<number>> = new Map();
  private symbolId: number = 0;
  private symbolIdToFileId: Map<number, number> = new Map();

  addExport(fileOrPath: ICodegenFile | string, imp: ICodegenImport): void {
    const file = this.ensureFile(fileOrPath);
    file.addExport(imp);
  }

  addImport(fileOrPath: ICodegenFile | string, imp: ICodegenImport): void {
    const file = this.ensureFile(fileOrPath);
    file.addImport(imp);
  }

  addSymbol(
    fileOrPath: ICodegenFile | string,
    symbol: ICodegenSymbolIn,
  ): ICodegenSymbolOut {
    const file = this.ensureFile(fileOrPath);
    return file.addSymbol(symbol);
  }

  createFile(
    path: string,
    meta: Omit<ICodegenFile['meta'], 'renderer'> & {
      /**
       * Renderer to use to render this file.
       */
      renderer?: ICodegenRenderer;
    } = {},
  ): ICodegenFile {
    const { renderer, ..._meta } = meta;
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

    const file = new CodegenFile(path, this, {
      ..._meta,
      renderer: renderer?.id,
    });
    this.fileOrder.push(file);
    this.filePathToFileId.set(path, file.id);
    this.fileIdToFile.set(file.id, file);
    return file;
  }

  ensureFile(fileOrPath: ICodegenFile | string): ICodegenFile {
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

  get files(): ReadonlyArray<ICodegenFile> {
    return [...this.fileOrder];
  }

  getAllSymbols(): ReadonlyArray<Pick<ICodegenSymbolOut, 'name'>> {
    return this.fileOrder.flatMap((file) => file.getAllSymbols());
  }

  getFileByPath(path: string): ICodegenFile | undefined {
    const fileId = this.filePathToFileId.get(path);
    return fileId !== undefined ? this.fileIdToFile.get(fileId) : undefined;
  }

  getFileBySymbolId(id: number): ICodegenFile | undefined {
    const fileId = this.symbolIdToFileId.get(id);
    return fileId !== undefined ? this.fileIdToFile.get(fileId) : undefined;
  }

  private getFileRenderer(file: ICodegenFile): ICodegenRenderer | undefined {
    return file.meta.renderer
      ? this.renderers.get(file.meta.renderer)
      : undefined;
  }

  getSymbolById(id: number): ICodegenSymbolOut | undefined {
    const file = this.getFileBySymbolId(id);
    return file?.getSymbolById(id);
  }

  incrementFileId(): number {
    return this.fileId++;
  }

  incrementSymbolId(): number {
    return this.symbolId++;
  }

  registerSymbol(symbol: ICodegenSymbolOut, file: ICodegenFile): void {
    this.symbolIdToFileId.set(symbol.id, file.id);
    if (symbol.selector) {
      const selector = JSON.stringify(symbol.selector);
      const ids = this.selectorToSymbolIds.get(selector) ?? [];
      ids.push(symbol.id);
      this.selectorToSymbolIds.set(selector, ids);
    }
  }

  render(meta?: ICodegenMeta): ReadonlyArray<ICodegenOutput> {
    const results: Array<ICodegenOutput> = [];
    this.fileOrder.forEach((file, index) => {
      const renderer = this.getFileRenderer(file);
      if (!renderer) return;
      results[index] = {
        content: renderer.renderSymbols(file, meta),
        meta: file.meta,
        path: `${file.path}${file.meta.extension ?? ''}`,
      };
    });
    this.fileOrder.forEach((file, index) => {
      const renderer = this.getFileRenderer(file);
      if (!renderer || !results[index]) return;
      const header = renderer.renderHeader(file, meta);
      const content = replaceWrappedIds(results[index].content, (symbolId) =>
        renderer.replacerFn({ file, symbolId }),
      );
      results[index].content = `${header}${content}`;
    });
    return results.filter(Boolean);
  }

  selectSymbolAll(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ReadonlyArray<ICodegenSymbolOut> {
    const ids = this.selectorToSymbolIds.get(JSON.stringify(selector)) ?? [];
    const symbols: Array<ICodegenSymbolOut> = [];
    for (const id of ids) {
      const f = this.getFileBySymbolId(id);
      if (!f || (file && file !== f)) continue;
      const symbol = f.getSymbolById(id);
      if (!symbol) continue;
      symbols.push(symbol);
    }
    return symbols;
  }

  selectSymbolFirst(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ICodegenSymbolOut | undefined {
    const symbols = this.selectSymbolAll(selector, file);
    return symbols[0];
  }

  selectSymbolFirstOrThrow(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ICodegenSymbolOut {
    const symbol = this.selectSymbolFirst(selector, file);
    if (!symbol)
      throw new Error(
        `symbol for selector not found: ${JSON.stringify(selector)}`,
      );
    return symbol;
  }

  selectSymbolLast(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ICodegenSymbolOut | undefined {
    const symbols = this.selectSymbolAll(selector, file);
    return symbols[symbols.length - 1];
  }
}
