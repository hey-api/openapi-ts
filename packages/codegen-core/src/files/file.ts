import path from 'node:path';

import type { ICodegenImport } from '../imports/types';
import type { ICodegenSymbol } from '../symbols/types';
import type { ICodegenFile } from './types';

export class CodegenFile implements ICodegenFile {
  private cache: {
    exports?: ReadonlyArray<ICodegenImport>;
    imports?: ReadonlyArray<ICodegenImport>;
    symbols?: ReadonlyArray<ICodegenSymbol>;
  } = {};

  private state: {
    exports: Map<string, ICodegenImport>;
    imports: Map<string, ICodegenImport>;
    symbols: Map<string, ICodegenSymbol>;
  } = {
    exports: new Map(),
    imports: new Map(),
    symbols: new Map(),
  };

  constructor(
    public path: string,
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
    if (existing) {
      this.mergeImportExportValues(existing, value);
      this.state[field].set(key, existing);
    } else {
      this.state[field].set(key, { ...value }); // clone to avoid mutation
    }
    this.cache[field] = undefined;
  }

  addSymbol(symbol: ICodegenSymbol): void {
    const key = symbol.name;
    const existing = this.state.symbols.get(key);
    if (existing) {
      existing.value = symbol.value;
      this.state.symbols.set(key, existing);
    } else {
      this.state.symbols.set(key, { ...symbol }); // clone to avoid mutation
    }
    this.cache.symbols = undefined;
  }

  get exports(): ReadonlyArray<ICodegenImport> {
    if (!this.cache.exports) {
      this.cache.exports = Array.from(this.state.exports.values());
    }
    return this.cache.exports;
  }

  getAllSymbols(): ReadonlyArray<ICodegenSymbol> {
    return [
      ...this.symbols,
      ...this.imports.flatMap((imp) =>
        (imp.names ?? []).map((name) => ({
          name: imp.aliases?.[name] ?? name,
        })),
      ),
      ...this.exports.flatMap((imp) =>
        (imp.names ?? []).map((name) => ({
          name: imp.aliases?.[name] ?? name,
        })),
      ),
    ];
  }

  hasContent(): boolean {
    return this.state.symbols.size > 0 || this.state.exports.size > 0;
  }

  hasSymbol(name: string): boolean {
    return this.state.symbols.has(name);
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

  get symbols(): ReadonlyArray<ICodegenSymbol> {
    if (!this.cache.symbols) {
      this.cache.symbols = Array.from(this.state.symbols.values());
    }
    return this.cache.symbols;
  }
}
