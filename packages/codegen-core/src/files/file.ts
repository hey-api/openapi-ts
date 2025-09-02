import path from 'node:path';

import type { ICodegenImport } from '../imports/types';
import type { ICodegenProject } from '../project/types';
import { idToPlaceholder } from '../renderers/renderer';
import type {
  ICodegenSymbolIn,
  ICodegenSymbolOut,
  ICodegenSymbolSelector,
} from '../symbols/types';
import type { ICodegenFile } from './types';

export class CodegenFile implements ICodegenFile {
  private cache: {
    exports?: ReadonlyArray<ICodegenImport>;
    imports?: ReadonlyArray<ICodegenImport>;
    symbols?: ReadonlyArray<ICodegenSymbolOut>;
  } = {};

  private state: {
    exports: Map<string, ICodegenImport>;
    imports: Map<string, ICodegenImport>;
    renderSymbols: Array<number>;
    symbols: Map<number, ICodegenSymbolOut>;
  } = {
    exports: new Map(),
    imports: new Map(),
    renderSymbols: [],
    symbols: new Map(),
  };

  constructor(
    public path: string,
    public project: ICodegenProject,
    public meta: ICodegenFile['meta'] = {},
  ) {
    let filePath = CodegenFile.pathToFilePath(path);
    if (meta.path) {
      if (typeof meta.path === 'function') {
        filePath = meta.path(filePath);
      } else {
        filePath = meta.path.replace('{{path}}', filePath);
      }
    }
    this.path = filePath;
  }

  addExport(exp: ICodegenImport): void {
    return this.addImportExport(exp, 'exports');
  }

  addImport(imp: ICodegenImport): void {
    return this.addImportExport(imp, 'imports');
  }

  private addImportExport(
    value: ICodegenImport,
    field: 'exports' | 'imports',
  ): void {
    const key = typeof value.from === 'string' ? value.from : value.from.path;
    const existing = this.state[field].get(key);
    // cast type names to names to allow for cleaner API,
    // otherwise users would have to define the same values twice
    if (!value.names) value.names = [];
    for (const typeName of value.typeNames ?? []) {
      if (!value.names.includes(typeName)) {
        value.names = [...value.names, typeName];
      }
    }
    if (existing) {
      this.mergeImportExportValues(existing, value);
      this.state[field].set(key, existing);
    } else {
      this.state[field].set(key, { ...value }); // clone to avoid mutation
    }
    this.cache[field] = undefined; // invalidate cache
  }

  private addRenderSymbol(id: number): void {
    this.state.renderSymbols.push(id);
    this.cache.symbols = undefined; // invalidate cache
  }

  addSymbol(symbol: ICodegenSymbolIn): ICodegenSymbolOut {
    const id = this.project.incrementId();
    const inserted: ICodegenSymbolOut = {
      ...symbol, // clone to avoid mutation
      id,
      placeholder: idToPlaceholder(id),
    };
    if (inserted.value === undefined) {
      // register symbols without value as headless
      inserted.headless = true;
    } else if (!inserted.headless) {
      delete inserted.headless;
    }
    this.state.symbols.set(id, inserted);
    this.project.registerSymbol(inserted, this);
    if (!inserted.headless) {
      this.addRenderSymbol(id);
    }
    return inserted;
  }

  ensureSymbol(
    symbol: Partial<ICodegenSymbolIn> &
      Pick<Required<ICodegenSymbolIn>, 'selector'>,
  ): ICodegenSymbolOut {
    return (
      this.selectSymbolFirst(symbol.selector) ||
      this.addSymbol({ name: '', ...symbol })
    );
  }

  get exports(): ReadonlyArray<ICodegenImport> {
    if (!this.cache.exports) {
      this.cache.exports = Array.from(this.state.exports.values());
    }
    return this.cache.exports;
  }

  getAllSymbols(): ReadonlyArray<ICodegenSymbolOut> {
    return [
      ...this.symbols,
      ...this.imports.flatMap((imp) =>
        (imp.names ?? []).map((name) => ({
          // TODO: real ID
          id: -1,
          name: imp.aliases?.[name] ?? name,
          // TODO: real placeholder
          placeholder: '',
        })),
      ),
      ...this.exports.flatMap((imp) =>
        (imp.names ?? []).map((name) => ({
          // TODO: real ID
          id: -1,
          name: imp.aliases?.[name] ?? name,
          // TODO: real placeholder
          placeholder: '',
        })),
      ),
    ];
  }

  getSymbolById(id: number): ICodegenSymbolOut | undefined {
    return this.state.symbols.get(id);
  }

  hasContent(): boolean {
    return this.state.exports.size > 0 || this.symbols.length > 0;
  }

  hasSymbol(id: number): boolean {
    return this.state.symbols.has(id);
  }

  get imports(): ReadonlyArray<ICodegenImport> {
    if (!this.cache.imports) {
      this.cache.imports = Array.from(this.state.imports.values());
    }
    return this.cache.imports;
  }

  private mergeImportExportValues(
    target: ICodegenImport,
    source: ICodegenImport,
  ): void {
    target.aliases = { ...target.aliases, ...source.aliases };
    if (source.defaultImport !== undefined) {
      target.defaultImport = source.defaultImport;
    }
    target.names = [
      ...new Set([...(target.names ?? []), ...(source.names ?? [])]),
    ];
    if (source.namespaceImport !== undefined) {
      target.namespaceImport = source.namespaceImport;
    }
    if (source.typeDefaultImport !== undefined) {
      target.typeDefaultImport = source.typeDefaultImport;
    }
    target.typeNames = [
      ...new Set([...(target.typeNames ?? []), ...(source.typeNames ?? [])]),
    ];
    if (source.typeNamespaceImport !== undefined) {
      target.typeNamespaceImport = source.typeNamespaceImport;
    }
  }

  patchSymbol(
    id: number,
    symbol: Partial<ICodegenSymbolOut>,
  ): ICodegenSymbolOut {
    const existing = this.state.symbols.get(id);
    if (!existing) {
      throw new Error(`symbol with id ${id} not found`);
    }
    const patched: ICodegenSymbolOut = { ...existing, ...symbol, id };
    // symbols with value can't be headless, clear redundant flag otherwise
    if (!patched.headless || patched.value) {
      delete patched.headless;
    }
    this.state.symbols.set(patched.id, patched);
    if (existing.headless && !patched.headless) {
      this.addRenderSymbol(id);
    }
    return patched;
  }

  static pathToFilePath(source: string): string {
    if (source.includes('/')) {
      return source.split('/').filter(Boolean).join(path.sep);
    }
    if (source.includes('\\')) {
      return source.split('\\').filter(Boolean).join(path.sep);
    }
    return source.split(path.sep).filter(Boolean).join(path.sep);
  }

  relativePathFromFile(file: Pick<ICodegenFile, 'path'>): string {
    let relativePath = path.posix.relative(
      path.posix.dirname(file.path),
      this.path,
    );
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  }

  relativePathToFile(file: Pick<ICodegenFile, 'path'>): string {
    let relativePath = path.posix.relative(
      path.posix.dirname(this.path),
      file.path,
    );
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  }

  selectSymbolAll(
    selector: ICodegenSymbolSelector,
  ): ReadonlyArray<ICodegenSymbolOut> {
    return this.project.selectSymbolAll(selector, this);
  }

  selectSymbolFirst(
    selector: ICodegenSymbolSelector,
  ): ICodegenSymbolOut | undefined {
    return this.project.selectSymbolFirst(selector, this);
  }

  selectSymbolFirstOrThrow(
    selector: ICodegenSymbolSelector,
  ): ICodegenSymbolOut {
    return this.project.selectSymbolFirstOrThrow(selector, this);
  }

  selectSymbolLast(
    selector: ICodegenSymbolSelector,
  ): ICodegenSymbolOut | undefined {
    return this.project.selectSymbolLast(selector, this);
  }

  get symbols(): ReadonlyArray<ICodegenSymbolOut> {
    if (!this.cache.symbols) {
      this.cache.symbols = this.state.renderSymbols.map(
        (id) => this.state.symbols.get(id)!,
      );
    }
    return this.cache.symbols;
  }
}
