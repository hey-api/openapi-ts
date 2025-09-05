import { CodegenFile } from '../files/file';
import type { ICodegenFile } from '../files/types';
import type { ICodegenImport } from '../imports/types';
import type { ICodegenMeta } from '../meta/types';
import type { ICodegenOutput } from '../output/types';
import type { ICodegenRenderer } from '../renderers/types';
import type {
  ICodegenSymbolIn,
  ICodegenSymbolOut,
  ICodegenSymbolSelector,
} from '../symbols/types';
import type { ICodegenProject } from './types';

export class CodegenProject implements ICodegenProject {
  private state: {
    files: Map<string, ICodegenFile>;
    filesOrder: Array<ICodegenFile>;
    id: number;
    idToFile: Map<number, ICodegenFile>;
    renderers: Map<string, ICodegenRenderer>;
    selectorToIds: Map<string, Array<number>>;
  } = {
    files: new Map(),
    filesOrder: [],
    id: 0,
    idToFile: new Map(),
    renderers: new Map(),
    selectorToIds: new Map(),
  };

  addExportToFile(
    fileOrPath: ICodegenFile | string,
    imp: ICodegenImport,
  ): void {
    const file = this.ensureFile(fileOrPath);
    file.addExport(imp);
  }

  addImportToFile(
    fileOrPath: ICodegenFile | string,
    imp: ICodegenImport,
  ): void {
    const file = this.ensureFile(fileOrPath);
    file.addImport(imp);
  }

  addSymbolToFile(
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
    this.state.filesOrder.push(file);
    this.state.files.set(path, file);
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
    if (!this.state.renderers.has(renderer.id)) {
      this.state.renderers.set(renderer.id, renderer);
    }
    return this.state.renderers.get(renderer.id)!;
  }

  get files(): ReadonlyArray<ICodegenFile> {
    return [...this.state.filesOrder];
  }

  getAllSymbols(): ReadonlyArray<ICodegenSymbolOut> {
    return this.state.filesOrder.flatMap((file) => file.getAllSymbols());
  }

  getFileByPath(path: string): ICodegenFile | undefined {
    return this.state.files.get(path);
  }

  getFileBySymbol(symbol: Pick<ICodegenSymbolOut, 'id'>): ICodegenFile {
    const file = this.state.idToFile.get(symbol.id);
    if (!file)
      throw new Error(`file for symbol not found: ${String(symbol.id)}`);
    return file;
  }

  incrementId(): number {
    return this.state.id++;
  }

  registerSymbol(symbol: ICodegenSymbolOut, file: ICodegenFile): void {
    this.state.idToFile.set(symbol.id, file);
    if (symbol.selector) {
      const selector = JSON.stringify(symbol.selector);
      const ids = this.state.selectorToIds.get(selector) ?? [];
      ids.push(symbol.id);
      this.state.selectorToIds.set(selector, ids);
    }
  }

  render(meta?: ICodegenMeta): ReadonlyArray<ICodegenOutput> {
    const results: Array<ICodegenOutput> = [];
    for (const file of this.state.filesOrder) {
      if (!file.meta.renderer) continue;
      const renderer = this.state.renderers.get(file.meta.renderer);
      if (!renderer) continue;
      results.push(renderer.render(file, meta));
    }
    return results;
  }

  selectSymbolAll(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ReadonlyArray<ICodegenSymbolOut> {
    const ids = this.state.selectorToIds.get(JSON.stringify(selector)) ?? [];
    const symbols: Array<ICodegenSymbolOut> = [];
    for (const id of ids) {
      const f = this.state.idToFile.get(id);
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
