import path from 'node:path';

import type { IProjectRenderMeta } from '../extensions';
import { FileRegistry } from '../files/registry';
import type { IFileSelector } from '../files/types';
import { NodeRegistry } from '../nodes/registry';
import type { IOutput } from '../output';
import type { IRenderer } from '../renderer/types';
import { Analyzer } from '../symbols/analyzer';
import { SymbolRegistry } from '../symbols/registry';
import type { Symbol } from '../symbols/symbol';
import type { SymbolKind } from '../symbols/types';
import { canShareName } from './namespace';
import type { IProject } from './types';

const externalSourceSymbol = '@';

export class Project implements IProject {
  readonly analyzer = new Analyzer();
  readonly defaultFileName: string;
  readonly files = new FileRegistry();
  readonly fileName?: (name: string) => string;
  readonly nodes = new NodeRegistry();
  readonly renderers: Record<string, IRenderer> = {};
  readonly root: string;
  readonly symbols = new SymbolRegistry();

  constructor({
    defaultFileName,
    fileName,
    renderers,
    root,
  }: Pick<IProject, 'defaultFileName' | 'fileName' | 'renderers' | 'root'>) {
    this.defaultFileName = defaultFileName ?? 'main';
    this.fileName = typeof fileName === 'string' ? () => fileName : fileName;
    this.renderers = renderers;
    this.root = root;
  }

  render(meta?: IProjectRenderMeta): ReadonlyArray<IOutput> {
    this.prepareFiles();
    return this.renderFiles(meta);
  }

  private prepareFiles(): void {
    this.assignFiles();
    this.registerFiles();
    this.resolveFinalSymbolNames();
    this.planImports();
    this.planExports();
  }

  /**
   * Creates a file for every symbol so all files exist before planning.
   */
  private assignFiles(): void {
    this.analyzer.analyze(this.nodes.all(), (ctx) => {
      const symbol = ctx.root;
      const selector = this.symbolToFileSelector(symbol);
      const file = this.files.reference(selector);
      file.symbols.push(symbol);
      symbol.setFile(file);
      for (const exportFrom of symbol.exportFrom) {
        const selector = [exportFrom];
        this.files.reference(selector);
      }
      for (const dependency of ctx.symbols) {
        if (dependency.external) {
          const selector = this.symbolToFileSelector(dependency);
          const file = this.files.reference(selector);
          dependency.setFile(file);
        }
      }
    });
  }

  private planExports(): void {
    const seenByFile = new Map<
      number,
      Map<string, { dep: Symbol; kinds: Set<SymbolKind> }>
    >();
    const sourceFile = new Map<number, number>();

    this.analyzer.analyze(this.nodes.all(), (ctx) => {
      const symbol = ctx.root;
      const file = ctx.root.file;
      if (!file) return;

      for (const exportFrom of symbol.exportFrom) {
        const target = this.files.reference([exportFrom]);
        if (target.id === file.id) continue;

        let map = seenByFile.get(target.id);
        if (!map) {
          map = new Map();
          seenByFile.set(target.id, map);
        }

        const dep = this.symbols.register({
          exported: true,
          external: symbol.external,
          importKind: symbol.importKind,
          kind: symbol.kind,
          meta: symbol.meta,
          name: symbol.finalName,
        });
        dep.setFile(target);
        sourceFile.set(dep.id, file.id);
        this.resolveSymbolFinalName(dep);

        let entry = map.get(dep.finalName);
        if (!entry) {
          entry = { dep, kinds: new Set() };
          map.set(dep.finalName, entry);
        }
        entry.kinds.add(dep.kind);
      }
    });

    for (const [fileId, map] of seenByFile) {
      const target = this.files.get(fileId)!;
      for (const [, entry] of map) {
        const symbol = entry.dep;
        target.reexports.push({
          exportedName: symbol.finalName,
          from: sourceFile.get(symbol.id)!,
          importedName: symbol.name,
          isTypeOnly: [...entry.kinds].every(
            (kind) => kind === 'type' || kind === 'interface',
          ),
          kind: symbol.importKind,
          symbolId: symbol.id,
        });
      }
    }
  }

  private planImports(): void {
    const seenByFile = new Map<number, Set<string>>();

    this.analyzer.analyze(this.nodes.all(), (ctx) => {
      const file = ctx.root.file;
      if (!file) return;

      let seen = seenByFile.get(file.id);
      if (!seen) {
        seen = new Set();
        seenByFile.set(file.id, seen);
      }

      for (const dependency of ctx.symbols) {
        if (!dependency.file || dependency.file.id === file.id) continue;

        this.resolveSymbolFinalName(dependency);
        const from = dependency.file.id;
        const importedName = dependency.name;
        const localName = dependency.finalName;
        const isTypeOnly = false; // keep as-is for now
        const kind = dependency.importKind;

        const key = `${from}|${importedName}|${localName}|${kind}|${isTypeOnly}`;
        if (seen.has(key)) continue;
        seen.add(key);

        file.imports.push({
          from,
          importedName,
          isTypeOnly,
          kind,
          localName,
          symbolId: dependency.id,
        });
      }
    });
  }

  /**
   * Registers all files.
   */
  private registerFiles(): void {
    for (const file of this.files.referenced()) {
      const selector = file.selector;
      if (!selector) continue;
      if (selector[0] === externalSourceSymbol) {
        this.files.register({
          external: true,
          path: selector[1],
          selector,
        });
      } else {
        const dirs = file.selector.slice(0, -1);
        let name = file.selector[file.selector.length - 1]!;
        name = this.fileName?.(name) || name;
        const extension = '.ts';
        this.files.register({
          extension,
          name,
          path: path.resolve(this.root, ...dirs, `${name}${extension}`),
          selector: file.selector,
        });
      }
    }
  }

  private renderFiles(meta?: IProjectRenderMeta): ReadonlyArray<IOutput> {
    const files: Map<number, IOutput> = new Map();
    for (const file of this.files.registered()) {
      if (file.external || !file.path) continue;
      const renderer = file.extension
        ? this.renderers[file.extension]
        : undefined;
      if (!renderer) continue;
      files.set(file.id, {
        content: renderer.render(file, this, meta),
        path: file.path,
      });
    }
    return Array.from(files.values());
  }

  private resolveSymbolFinalName(symbol: Symbol): void {
    const file = symbol.file;
    if (symbol._finalName || !file) return;

    let name = symbol.name;
    let index = 1;
    while (file.reservedNames.has(name)) {
      const scopes = file.reservedNames.get(name)!;
      let exit = true;
      for (const kind of scopes) {
        if (!canShareName(symbol.kind, kind)) {
          exit = false;
          index = index + 1;
          name = `${name}${index}`;
          break;
        }
      }
      if (exit) break;
    }
    // TODO: ensure valid names
    symbol.setFinalName(name);
    const scopes = file.reservedNames.get(name) ?? new Set<SymbolKind>();
    scopes.add(symbol.kind);
    file.reservedNames.set(name, scopes);
  }

  private resolveFinalSymbolNames(): void {
    for (const file of this.files.registered()) {
      for (const symbol of file.symbols) {
        this.resolveSymbolFinalName(symbol);
      }
    }
  }

  private symbolToFileSelector(symbol: Symbol): IFileSelector {
    if (symbol.external) {
      return [externalSourceSymbol, symbol.external];
    }
    const filePath = symbol.getFilePath?.(symbol);
    if (filePath) {
      return filePath.split('/');
    }
    return [this.defaultFileName];
  }
}
