import path from 'node:path';

import type { ExportModule, ImportModule } from '../bindings';
import type { IProjectRenderMeta } from '../extensions';
import type { File } from '../files/file';
import type { IFileIn } from '../files/types';
import { canShareName } from '../project/namespace';
import type { IProject } from '../project/types';
import { fromRef } from '../refs/refs';
import type { RenderContext } from '../renderer';
import type { Symbol } from '../symbols/symbol';
import type { SymbolKind } from '../symbols/types';
import type { AnalysisContext } from './analyzer';
import { Analyzer } from './analyzer';
import type { AssignOptions, Scope } from './scope';
import { createScope } from './scope';

const isTypeOnlyKind = (kind: SymbolKind) =>
  kind === 'type' || kind === 'interface';

export class Planner {
  private readonly analyzer = new Analyzer();
  private readonly cacheResolvedNames = new Set<number>();
  private readonly project: IProject;

  constructor(project: IProject) {
    this.project = project;
  }

  /**
   * Executes the planning phase for the project.
   */
  plan(meta?: IProjectRenderMeta) {
    this.cacheResolvedNames.clear();
    this.allocateFiles();
    this.assignLocalNames();
    this.resolveFilePaths(meta);
    this.planExports();
    this.planImports();
  }

  /**
   * Creates and assigns a file to every node, re-export,
   * and external dependency.
   */
  private allocateFiles(): void {
    this.analyzer.analyze(this.project.nodes.all(), (ctx, node) => {
      const symbol = node.symbol;
      if (!symbol) return;

      const file = this.project.files.register(this.symbolToFileIn(symbol));
      file.addNode(node);
      symbol.setFile(file);
      for (const exportFrom of symbol.exportFrom) {
        this.project.files.register({
          external: false,
          language: file.language,
          logicalFilePath: exportFrom,
        });
      }
      ctx.walkScopes((dependency) => {
        const dep = fromRef(dependency);
        if (dep.external && dep.isCanonical && !dep.file) {
          const file = this.project.files.register(this.symbolToFileIn(dep));
          dep.setFile(file);
        }
      });
    });
  }

  /**
   * Assigns final names to all symbols.
   *
   * First assigns top-level (file-scoped) symbol names, then local symbols.
   */
  private assignLocalNames(): void {
    this.analyzer.analyze(this.project.nodes.all(), (ctx, node) => {
      const symbol = node.symbol;
      if (!symbol) return;
      this.assignTopLevelName({ ctx, symbol });
    });

    this.analyzer.analyze(this.project.nodes.all(), (ctx, node) => {
      const file = node.file;
      if (!file) return;
      ctx.walkScopes((dependency) => {
        const dep = fromRef(dependency);
        // top-level or external symbol
        if (dep.file) return;
        this.assignLocalName({
          ctx,
          file,
          scopesToUpdate: [createScope({ localNames: file.allNames })],
          symbol: dep,
        });
      });
    });
  }

  /**
   * Resolves and sets final file paths for all non-external files. Attaches renderers.
   *
   * Uses the project's fileName function if provided, otherwise uses the file's current name.
   *
   * Resolves final paths relative to the project's root directory.
   */
  private resolveFilePaths(meta?: IProjectRenderMeta): void {
    for (const file of this.project.files.registered()) {
      if (file.external) continue;
      const finalName = this.project.fileName?.(file.name) || file.name;
      file.setName(finalName);
      const finalPath = file.finalPath;
      if (finalPath) {
        file.setFinalPath(path.resolve(this.project.root, finalPath));
      }
      const ctx: RenderContext = { file, meta, project: this.project };
      const renderer = this.project.renderers.find((r) => r.supports(ctx));
      if (renderer) file.setRenderer(renderer);
    }
  }

  /**
   * Plans exports by analyzing all exported symbols.
   *
   * Registers re-export targets as files and creates new exported symbols for them.
   *
   * Assigns names to re-exported symbols and collects re-export metadata,
   * distinguishing type-only exports based on symbol kinds.
   */
  private planExports(): void {
    const seenByFile = new Map<
      File,
      Map<string, { kinds: Set<SymbolKind>; symbol: Symbol }>
    >();
    const sourceFile = new Map<number, File>();

    this.analyzer.analyze(this.project.nodes.all(), (ctx, node) => {
      if (!node.exported) return;

      const symbol = node.symbol;
      if (!symbol) return;

      const file = node.file;
      if (!file) return;

      for (const exportFrom of symbol.exportFrom) {
        const target = this.project.files.register({
          external: false,
          language: node.language,
          logicalFilePath: exportFrom,
        });
        if (target.id === file.id) continue;

        let fileMap = seenByFile.get(target);
        if (!fileMap) {
          fileMap = new Map();
          seenByFile.set(target, fileMap);
        }

        const exp = this.project.symbols.register({
          exported: true,
          external: symbol.external,
          importKind: symbol.importKind,
          kind: symbol.kind,
          name: symbol.finalName,
        });
        exp.setFile(target);
        sourceFile.set(exp.id, file);
        this.assignTopLevelName({ ctx, symbol: exp });

        let entry = fileMap.get(exp.finalName);
        if (!entry) {
          entry = { kinds: new Set(), symbol: exp };
          fileMap.set(exp.finalName, entry);
        }
        entry.kinds.add(exp.kind);
      }
    });

    for (const [file, fileMap] of seenByFile) {
      const exports = new Map<File, ExportModule>();
      for (const [, entry] of fileMap) {
        const source = sourceFile.get(entry.symbol.id)!;
        let exp = exports.get(source);
        if (!exp) {
          exp = {
            canExportAll: true,
            exports: [],
            from: source,
            isTypeOnly: true,
          };
        }
        const isTypeOnly = [...entry.kinds].every((kind) =>
          isTypeOnlyKind(kind),
        );
        const exportedName = entry.symbol.finalName;
        exp.exports.push({
          exportedName,
          isTypeOnly,
          kind: entry.symbol.importKind,
          sourceName: entry.symbol.name,
        });
        if (entry.symbol.name !== entry.symbol.finalName) {
          exp.canExportAll = false;
        }
        if (!isTypeOnly) {
          exp.isTypeOnly = false;
        }
        exports.set(source, exp);
      }
      for (const [, exp] of exports) {
        file.addExport(exp);
      }
    }
  }

  /**
   * Plans imports by analyzing symbol dependencies across files.
   *
   * For external dependencies, assigns top-level names.
   *
   * Creates or reuses import symbols for dependencies from other files,
   * assigning names and updating import metadata including type-only flags.
   */
  private planImports(): void {
    const seenByFile = new Map<
      File,
      Map<
        string,
        {
          dep: Symbol;
          kinds: Set<SymbolKind>;
          symbol: Symbol;
        }
      >
    >();

    this.analyzer.analyze(this.project.nodes.all(), (ctx) => {
      const symbol = ctx.symbol;
      if (!symbol) return;

      const file = symbol.file;
      if (!file) return;

      let fileMap = seenByFile.get(file);
      if (!fileMap) {
        fileMap = new Map();
        seenByFile.set(file, fileMap);
      }

      ctx.walkScopes((dependency) => {
        const dep = fromRef(dependency);
        if (!dep.file || dep.file.id === file.id) return;

        if (dep.external) {
          this.assignTopLevelName({ ctx, symbol: dep });
        }

        const fromFileId = dep.file.id;
        const importedName = dep.finalName;
        const isTypeOnly = isTypeOnlyKind(dep.kind);
        const kind = dep.importKind;
        const key = `${fromFileId}|${importedName}|${kind}|${isTypeOnly}`;

        let entry = fileMap.get(key);
        if (!entry) {
          const imp = this.project.symbols.register({
            exported: dep.exported,
            external: dep.external,
            importKind: dep.importKind,
            kind: dep.kind,
            name: dep.finalName,
          });
          imp.setFile(file);
          this.assignTopLevelName({
            ctx,
            scope: createScope({ localNames: imp.file!.allNames }),
            symbol: imp,
          });
          entry = {
            dep,
            kinds: new Set(),
            symbol: imp,
          };
          fileMap.set(key, entry);
          entry.kinds.add(imp.kind);
        }

        dependency['~ref'] = entry.symbol;
      });
    });

    for (const [file, fileMap] of seenByFile) {
      const imports = new Map<File, ImportModule>();
      for (const [, entry] of fileMap) {
        const source = entry.dep.file!;
        let imp = imports.get(source);
        if (!imp) {
          imp = {
            from: source,
            imports: [],
            isTypeOnly: true,
          };
        }
        const isTypeOnly = [...entry.kinds].every((kind) =>
          isTypeOnlyKind(kind),
        );
        if (entry.symbol.importKind === 'namespace') {
          imp.imports = [];
          imp.namespaceImport = entry.symbol.finalName;
        } else {
          imp.imports.push({
            isTypeOnly,
            kind: entry.symbol.importKind,
            localName: entry.symbol.finalName,
            sourceName: entry.dep.finalName,
          });
        }
        if (!isTypeOnly) {
          imp.isTypeOnly = false;
        }
        imports.set(source, imp);
      }
      for (const [, imp] of imports) {
        file.addImport(imp);
      }
    }
  }

  /**
   * Assigns the final name to a top-level (file-scoped) symbol.
   *
   * Uses the symbol's file top-level names as the default scope,
   * and updates all relevant name scopes including the file's allNames and local scopes.
   *
   * Supports optional overrides for the naming scope and scopes to update.
   */
  private assignTopLevelName(
    args: Partial<AssignOptions> & {
      ctx: AnalysisContext;
      symbol: Symbol;
    },
  ): void {
    if (!args.symbol.file) return;
    this.assignSymbolName({
      ...args,
      file: args.symbol.file,
      scope:
        args?.scope ??
        createScope({ localNames: args.symbol.file.topLevelNames }),
      scopesToUpdate: [
        createScope({ localNames: args.symbol.file.allNames }),
        args.ctx.scopes,
        ...(args?.scopesToUpdate ?? []),
      ],
    });
  }

  /**
   * Assigns the final name to a non-top-level (local) symbol.
   *
   * Uses the provided scope or derives it from the current analysis context's local names.
   *
   * Updates all provided name scopes accordingly.
   */
  private assignLocalName(
    args: Pick<Partial<AssignOptions>, 'scope'> &
      Pick<AssignOptions, 'scopesToUpdate'> & {
        ctx: AnalysisContext;
        /** The file the symbol belongs to. */
        file: File;
        symbol: Symbol;
      },
  ): void {
    this.assignSymbolName({
      ...args,
      scope: args.scope ?? args.ctx.scope,
    });
  }

  /**
   * Assigns the final name to a symbol within the provided name scope.
   *
   * Resolves name conflicts until a unique name is found.
   *
   * Updates all specified name scopes with the assigned final name.
   */
  private assignSymbolName(
    args: AssignOptions & {
      ctx: AnalysisContext;
      /** The file the symbol belongs to. */
      file: File;
      symbol: Symbol;
    },
  ): void {
    const { ctx, file, scope, scopesToUpdate, symbol } = args;
    if (this.cacheResolvedNames.has(symbol.id)) return;

    const baseName = symbol.name;
    let finalName = symbol.node?.nameSanitizer?.(baseName) ?? baseName;
    let attempt = 1;

    const localNames = ctx.localNames(scope);
    while (true) {
      const kinds = [...(localNames.get(finalName) ?? [])];

      const ok = kinds.every((kind) => canShareName(symbol.kind, kind));
      if (ok) break;

      const language = symbol.node?.language || file.language;
      const resolver =
        (language ? this.project.nameConflictResolvers[language] : undefined) ??
        this.project.defaultNameConflictResolver;
      const resolvedName = resolver({ attempt, baseName });
      if (!resolvedName) {
        throw new Error(`Unresolvable name conflict: ${symbol.toString()}`);
      }

      finalName = symbol.node?.nameSanitizer?.(resolvedName) ?? resolvedName;
      attempt = attempt + 1;
    }

    symbol.setFinalName(finalName);
    this.cacheResolvedNames.add(symbol.id);
    const updateScopes = [scope, ...scopesToUpdate];
    for (const scope of updateScopes) {
      this.updateScope(symbol, scope);
    }
  }

  /**
   * Updates the provided name scope with the symbol's final name and kind.
   *
   * Ensures the name scope tracks all kinds associated with a given name.
   */
  private updateScope(symbol: Symbol, scope: Scope): void {
    const name = symbol.finalName;
    const cache = scope.localNames.get(name) ?? new Set();
    cache.add(symbol.kind);
    scope.localNames.set(name, cache);
  }

  private symbolToFileIn(symbol: Symbol): IFileIn {
    return {
      external: Boolean(symbol.external),
      language: symbol.node?.language,
      logicalFilePath:
        symbol.external ||
        symbol.getFilePath?.(symbol) ||
        this.project.defaultFileName,
    } satisfies IFileIn;
  }
}
