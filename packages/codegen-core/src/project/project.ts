import path from 'node:path';

import type { IProjectRenderMeta } from '../extensions';
import { FileRegistry } from '../files/registry';
import type { IFileOut, IFileSelector } from '../files/types';
import type { IOutput } from '../output';
import type { IRenderer } from '../renderer/types';
import { SymbolRegistry } from '../symbols/registry';
import type { Symbol } from '../symbols/symbol';
import type { IProject } from './types';

const externalSourceSymbol = '@';

export class Project implements IProject {
  private symbolIdToFileIds: Map<number, Set<number>> = new Map();

  readonly defaultFileName: string;
  readonly files = new FileRegistry();
  readonly fileName?: (name: string) => string;
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

  private getRenderer(file: IFileOut): IRenderer | undefined {
    return file.extension ? this.renderers[file.extension] : undefined;
  }

  private prepareFiles(): void {
    // TODO: infer extension from symbols
    const extension = '.ts';
    for (const symbol of this.symbols.registered()) {
      const selector = this.symbolToFileSelector(symbol);
      const file = this.files.reference(selector);
      file.symbols.body.push(symbol.id);
      // update symbol->files map
      const symbolIdToFileIds =
        this.symbolIdToFileIds.get(symbol.id) ?? new Set();
      symbolIdToFileIds.add(file.id);
      this.symbolIdToFileIds.set(symbol.id, symbolIdToFileIds);
      // update re-exports
      if (symbol.exportFrom) {
        for (const exportFrom of symbol.exportFrom) {
          const exportSelector = [exportFrom];
          const exportFile = this.files.reference(exportSelector);
          if (exportFile.id !== file.id) {
            exportFile.symbols.exports.push(symbol.id);
          }
        }
      }
    }
    for (const file of this.files.referenced()) {
      if (!file.selector) continue;
      if (file.selector[0] === externalSourceSymbol) {
        const filePath = file.selector[1];
        if (!filePath) {
          this.files.register({
            external: true,
            selector: file.selector,
          });
          continue;
        }
        const extension = path.extname(filePath);
        if (!extension) {
          this.files.register({
            external: true,
            path: filePath,
            selector: file.selector,
          });
          continue;
        }
        this.files.register({
          extension,
          external: true,
          path: filePath,
          selector: file.selector,
        });
        continue;
      }
      const dirs = file.selector.slice(0, -1);
      let name = file.selector[file.selector.length - 1]!;
      name = this.fileName?.(name) || name;
      this.files.register({
        extension,
        name,
        path: path.resolve(this.root, ...dirs, `${name}${extension}`),
        selector: file.selector,
      });
    }

    // TODO: track symbol dependencies and inject imports into files
    // based on symbol references so the render step can just render
  }

  render(meta?: IProjectRenderMeta): ReadonlyArray<IOutput> {
    this.prepareFiles();
    const files: Map<number, IOutput> = new Map();
    for (const file of this.files.registered()) {
      if (file.external || !file.path) continue;
      const renderer = this.getRenderer(file);
      if (!renderer) continue;
      files.set(file.id, {
        content: renderer.renderSymbols(file, this, meta),
        path: file.path,
      });
    }
    for (const [fileId, value] of files.entries()) {
      const file = this.files.get(fileId)!;
      const renderer = this.getRenderer(file)!;
      const content = renderer.renderFile(value.content, file, this, meta);
      if (content) {
        files.set(file.id, { ...value, content });
      } else {
        files.delete(file.id);
      }
    }
    return Array.from(files.values());
  }

  symbolIdToFiles(symbolId: number): ReadonlyArray<IFileOut> {
    const fileIds = this.symbolIdToFileIds.get(symbolId);
    return Array.from(fileIds ?? []).map((fileId) => this.files.get(fileId)!);
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
