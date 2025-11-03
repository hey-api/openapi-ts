import path from 'node:path';

import type {
  BiMap,
  Binding,
  File,
  IProject,
  ProjectRenderMeta,
  Renderer,
  Symbol,
} from '@hey-api/codegen-core';
import { createBinding, mergeBindings, renderIds } from '@hey-api/codegen-core';
import ts from 'typescript';

import { ensureValidIdentifier } from '~/openApi/shared/utils/identifier';
import { tsc } from '~/tsc';
import { tsNodeToString } from '~/tsc/utils';

const nodeBuiltins = new Set([
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'freelist',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'worker_threads',
  'zlib',
]);

export class TypeScriptRenderer implements Renderer {
  renderFile(
    symbolsAndExports: string,
    file: File,
    project: IProject,
    meta?: ProjectRenderMeta,
  ): string {
    const imports: Map<string, Binding> = new Map();
    symbolsAndExports = renderIds(symbolsAndExports, (symbolId) => {
      const symbol = project.symbols.get(symbolId);
      const replaced = this.replacerFn({ file, project, symbol });
      if (symbol) {
        this.addBinding({ bindings: imports, file, meta, project, symbol });
      }
      return replaced;
    });
    if (!symbolsAndExports.length) return '';
    let output = '';
    const headerLines = this.getHeaderLines();
    output += `${headerLines.join('\n')}${headerLines.length ? '\n\n' : ''}`;
    const importLines = this.getImportLines(imports, file, project);
    output += `${importLines.join('\n')}${importLines.length ? '\n\n' : ''}`;
    return `${output}${symbolsAndExports}`;
  }

  renderSymbols(
    file: File,
    project: IProject,
    meta?: ProjectRenderMeta,
  ): string {
    const exports: Map<string, Binding> = new Map();
    let output = '';
    const bodyLines = this.getBodyLines(file, project);
    output += `${bodyLines.join('\n\n')}${bodyLines.length ? '\n' : ''}`;
    output = renderIds(output, (symbolId) => {
      if (!file.symbols.body.includes(symbolId)) return;
      const symbol = project.symbols.get(symbolId);
      return this.replacerFn({ file, project, symbol });
    });
    for (const symbolId of file.symbols.exports) {
      const symbol = project.symbols.get(symbolId);
      if (symbol) {
        this.addBinding({ bindings: exports, file, meta, project, symbol });
      }
    }
    // cast everything into namespace exports for now
    for (const binding of exports.values()) {
      binding.namespaceBinding = true;
      binding.typeNamespaceBinding =
        binding.names &&
        binding.typeNames &&
        binding.names.length === binding.typeNames.length &&
        binding.names.every((name) => (binding.typeNames ?? []).includes(name));
    }
    const exportLines = this.getExportLines(exports, file, project);
    output += `${exportLines.join('\n')}${exportLines.length ? '\n' : ''}`;
    return output;
  }

  private addBinding({
    bindings,
    file,
    meta,
    project,
    symbol,
  }: {
    bindings: Map<string, Binding>;
    file: File;
    meta?: ProjectRenderMeta;
    project: IProject;
    symbol: Symbol;
  }): void {
    if (!symbol.external && !project.symbols.hasValue(symbol.id)) {
      return;
    }

    const [symbolFile] = project.symbolIdToFiles(symbol.id);
    if (!symbolFile || file === symbolFile) return;

    const modulePath = this.getBindingPath(file, symbolFile, meta);
    const existing = bindings.get(modulePath);
    const binding = createBinding({
      file,
      modulePath,
      symbol,
      symbolFile,
    });
    if (existing) {
      mergeBindings(existing, binding);
      bindings.set(modulePath, existing);
    } else {
      bindings.set(modulePath, binding);
    }
  }

  private getBindingPath(
    currentFile: File,
    symbolFile: File,
    meta?: ProjectRenderMeta,
  ): string {
    if (!currentFile.path || !symbolFile.path) {
      return '';
    }
    if (symbolFile.external && !path.isAbsolute(symbolFile.path)) {
      return symbolFile.path;
    }
    let relativePath = path.posix.relative(
      path.posix.dirname(
        currentFile.path.split(path.sep).join(path.posix.sep), // normalize to posix
      ),
      symbolFile.path.split(path.sep).join(path.posix.sep), // normalize to posix
    );
    if (!relativePath.startsWith('.') && relativePath !== '') {
      relativePath = `./${relativePath}`;
    }
    if (symbolFile.extension === '.ts') {
      if (relativePath.endsWith(symbolFile.extension)) {
        relativePath = relativePath.slice(0, -symbolFile.extension.length);
      }
      if (meta?.importFileExtension) {
        relativePath += meta.importFileExtension;
      } else if (relativePath.endsWith('/index')) {
        relativePath = relativePath.slice(0, -'/index'.length);
      }
    }
    return relativePath;
  }

  private getBodyLines(file: File, project: IProject): Array<string> {
    const lines: Array<string> = [];

    for (const symbolId of file.symbols.body) {
      const value = project.symbols.getValue(symbolId);
      if (typeof value === 'string') {
        lines.push(value);
      } else if (value instanceof Array) {
        for (const node of value) {
          lines.push(tsNodeToString({ node, unescape: true }));
        }
      } else if (value !== undefined && value !== null) {
        lines.push(tsNodeToString({ node: value as any, unescape: true }));
      }
    }

    return lines;
  }

  private getExportLines(
    bindings: Map<string, Binding>,
    file: File,
    project: IProject,
  ): Array<string> {
    const lines: Array<string> = [];

    for (const [from, value] of bindings.entries()) {
      const specifiers: Array<ts.ExportSpecifier> = [];
      let namespaceBinding: string | undefined;
      let isTypeOnly = false;

      if (value.namespaceBinding !== undefined) {
        if (typeof value.namespaceBinding === 'string') {
          namespaceBinding = renderIds(value.namespaceBinding, (symbolId) => {
            const symbol = project.symbols.get(symbolId);
            return this.replacerFn({ file, project, symbol });
          });
        }
        if (value.typeNamespaceBinding) {
          isTypeOnly = true;
        }
      } else if (value.names && value.names.length > 0) {
        if (
          value.names.every((name) => (value.typeNames ?? []).includes(name))
        ) {
          isTypeOnly = true;
        }

        for (const name of value.names) {
          const alias = value.aliases?.[name];
          let finalName = name;
          let finalAlias: string | undefined;
          if (alias && alias !== finalName) {
            finalAlias = finalName;
            finalName = alias;
          }
          finalName = renderIds(finalName, (symbolId) => {
            const symbol = project.symbols.get(symbolId);
            const name = this.replacerFn({ file, project, symbol });
            const [symbolFile] = project.symbolIdToFiles(symbolId);
            const sourceName = symbolFile
              ? symbolFile.resolvedNames.get(symbolId)
              : undefined;
            if (sourceName && sourceName !== name) {
              // handle only simple imports for now
              if (!finalAlias) {
                finalAlias = sourceName;
              }
            }
            return name;
          });
          if (finalAlias) {
            finalAlias = renderIds(finalAlias, (symbolId) => {
              const symbol = project.symbols.get(symbolId);
              return this.replacerFn({ file, project, symbol });
            });
            // remove redundant alias
            if (finalAlias === finalName) {
              finalAlias = undefined;
            }
          }
          const specifier = ts.factory.createExportSpecifier(
            isTypeOnly ? false : (value.typeNames?.includes(name) ?? false),
            finalAlias ? tsc.identifier({ text: finalAlias }) : undefined,
            tsc.identifier({ text: finalName }),
          );
          specifiers.push(specifier);
        }
      }

      const exportClause = namespaceBinding
        ? ts.factory.createNamespaceExport(
            tsc.identifier({ text: namespaceBinding }),
          )
        : specifiers.length
          ? ts.factory.createNamedExports(specifiers)
          : undefined;

      const node = ts.factory.createExportDeclaration(
        undefined,
        isTypeOnly,
        exportClause,
        tsc.stringLiteral({ isSingleQuote: true, text: from }),
      );
      lines.push(tsNodeToString({ node, unescape: true }));
    }

    return lines;
  }

  private getHeaderLines(): Array<string> {
    return ['// This file is auto-generated by @hey-api/openapi-ts'];
  }

  private getImportLines(
    bindings: Map<string, Binding>,
    file: File,
    project: IProject,
  ): Array<string> {
    const lines: Array<string> = [];

    let lastGroup = -1;
    const importSortKey = (binding: Binding): [number, number, string] => {
      const path = binding.from;
      if (!path.startsWith('.')) {
        // Node.js built-in
        if (nodeBuiltins.has(path.split('/')[0]!)) {
          return [0, 0, path];
        }
        // external package
        return [1, 0, path];
      }
      // sibling relative
      if (path.startsWith('./')) {
        return [2, 0, path];
      }
      // parent relative
      const parentCount = path.match(/\.\.\//g)?.length ?? 0;
      return [2, parentCount, path];
    };

    const sortedBindings = Array.from(bindings.values())
      .map((value) => ({
        ...value,
        k: importSortKey(value),
      }))
      .sort(
        (a, b) =>
          a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.k[2].localeCompare(b.k[2]),
      );

    for (const value of sortedBindings) {
      let specifiers: Array<ts.ImportSpecifier> = [];
      let defaultBinding: ts.Identifier | undefined;
      let namespaceBinding: string | undefined;
      let isTypeOnly = false;

      if (value.defaultBinding) {
        const processedDefaultBinding = renderIds(
          value.defaultBinding,
          (symbolId) => {
            const symbol = project.symbols.get(symbolId);
            return this.replacerFn({ file, project, symbol });
          },
        );
        defaultBinding = tsc.identifier({ text: processedDefaultBinding });
        if (value.typeDefaultBinding) {
          isTypeOnly = true;
        }
      } else if (typeof value.namespaceBinding === 'string') {
        namespaceBinding = renderIds(value.namespaceBinding, (symbolId) => {
          const symbol = project.symbols.get(symbolId);
          return this.replacerFn({ file, project, symbol });
        });
        if (value.typeNamespaceBinding) {
          isTypeOnly = true;
        }
      } else if (value.names && value.names.length > 0) {
        if (value.names.every((name) => value.typeNames?.includes(name))) {
          isTypeOnly = true;
        }

        const namedImports: Array<{
          isTypeOnly: boolean;
          name: string;
          propertyName: ts.ModuleExportName | undefined;
        }> = [];

        for (const name of value.names) {
          const alias = value.aliases?.[name];
          let finalName = name;
          let finalAlias: string | undefined;
          if (alias && alias !== finalName) {
            finalAlias = finalName;
            finalName = alias;
          }
          finalName = renderIds(finalName, (symbolId) => {
            const symbol = project.symbols.get(symbolId);
            const name = this.replacerFn({ file, project, symbol });
            const [symbolFile] = project.symbolIdToFiles(symbolId);
            const sourceName = symbolFile
              ? symbolFile.resolvedNames.get(symbolId)
              : undefined;
            if (sourceName && sourceName !== name) {
              // handle only simple imports for now
              if (!finalAlias) {
                finalAlias = sourceName;
              }
            }
            return name;
          });
          if (finalAlias) {
            finalAlias = renderIds(finalAlias, (symbolId) => {
              const symbol = project.symbols.get(symbolId);
              return this.replacerFn({ file, project, symbol });
            });
            // remove redundant alias
            if (finalAlias === finalName) {
              finalAlias = undefined;
            }
          }
          namedImports.push({
            isTypeOnly: isTypeOnly
              ? false
              : (value.typeNames?.includes(name) ?? false),
            name: finalName,
            propertyName: finalAlias
              ? tsc.identifier({ text: finalAlias })
              : undefined,
          });
        }

        specifiers = namedImports
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ isTypeOnly, name, propertyName }) =>
            ts.factory.createImportSpecifier(
              isTypeOnly,
              propertyName,
              tsc.identifier({ text: name }),
            ),
          );
      }

      const importClause = ts.factory.createImportClause(
        isTypeOnly,
        defaultBinding,
        namespaceBinding
          ? ts.factory.createNamespaceImport(
              tsc.identifier({ text: namespaceBinding }),
            )
          : specifiers.length
            ? ts.factory.createNamedImports(specifiers)
            : undefined,
      );

      const node = ts.factory.createImportDeclaration(
        undefined,
        importClause,
        tsc.stringLiteral({ isSingleQuote: true, text: value.from }),
      );

      if (lastGroup !== -1 && value.k[0] !== lastGroup) {
        lines.push(''); // add empty line between groups
      }

      lines.push(tsNodeToString({ node, unescape: true }));
      lastGroup = value.k[0];
    }

    return lines;
  }

  private getUniqueName(base: string, names: BiMap<number, string>): string {
    let index = 2;
    let name = base;
    while (names.hasValue(name)) {
      name = `${base}${index}`;
      index += 1;
    }
    return name;
  }

  private replacerFn({
    file,
    project,
    symbol,
  }: {
    file: File;
    project: IProject;
    symbol: Symbol | undefined;
  }): string | undefined {
    if (!symbol) return;
    const cached = file.resolvedNames.get(symbol.id);
    if (cached) return cached;
    if (!symbol.name) return;
    const [symbolFile] = project.symbolIdToFiles(symbol.id);
    const symbolFileResolvedName = symbolFile?.resolvedNames.get(symbol.id);
    let name = ensureValidIdentifier(symbolFileResolvedName ?? symbol.name);
    const conflictId = file.resolvedNames.getKey(name);
    if (conflictId !== undefined) {
      const conflictSymbol = project.symbols.get(conflictId);
      if (conflictSymbol) {
        const kinds = [conflictSymbol.kind, symbol.kind];
        if (
          kinds.every((kind) => kind === 'type') ||
          kinds.every((kind) => kind !== 'type') ||
          // avoid conflicts between class and type of the same name
          (kinds.includes('class') && kinds.includes('type'))
        ) {
          name = this.getUniqueName(name, file.resolvedNames);
        }
      }
    }
    file.resolvedNames.set(symbol.id, name);
    return name;
  }
}
