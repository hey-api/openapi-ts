import type { RenderContext, Renderer } from '@hey-api/codegen-core';
import type { MaybeArray, MaybeFunc } from '@hey-api/types';

import type { PyDsl } from '../../py-dsl';
import { py } from '../../ts-python';
import type { ModuleExport, ModuleImport, SortGroup, SortKey, SortModule } from './render-utils';
import { astToString, moduleSortKey } from './render-utils';

type Exports = ReadonlyArray<ReadonlyArray<ModuleExport>>;
type ExportsOptions = {
  preferExportAll?: boolean;
};
type Header = MaybeArray<string> | null | undefined;
type HeaderArg = MaybeFunc<(ctx: RenderContext<PyDsl>) => Header>;
type Imports = Array<ReadonlyArray<ModuleImport>>;

function headerToLines(header: Header): ReadonlyArray<string> {
  if (!header) return [];
  const lines: Array<string> = [];
  if (typeof header === 'string') {
    lines.push(...header.split(/\r?\n/));
    return lines;
  }
  for (const line of header) {
    lines.push(...line.split(/\r?\n/));
  }
  return lines;
}

export class PythonRenderer implements Renderer {
  /**
   * Function to generate a file header.
   *
   * @private
   */
  private _header?: HeaderArg;
  /**
   * Whether `export * from 'module'` should be used when possible instead of named exports.
   *
   * @private
   */
  private _preferExportAll: boolean;
  /**
   * Controls whether imports/exports include a file extension (e.g., '.ts' or '.js').
   *
   * @private
   */
  private _preferFileExtension: string;
  /**
   * Optional function to transform module specifiers.
   *
   * @private
   */
  private _resolveModuleName?: (moduleName: string) => string | undefined;

  constructor(
    args: {
      header?: HeaderArg;
      preferExportAll?: boolean;
      preferFileExtension?: string;
      resolveModuleName?: (moduleName: string) => string | undefined;
    } = {},
  ) {
    this._header = args.header;
    this._preferExportAll = args.preferExportAll ?? false;
    this._preferFileExtension = args.preferFileExtension ?? '';
    this._resolveModuleName = args.resolveModuleName;
  }

  render(ctx: RenderContext<PyDsl>): string {
    const header = typeof this._header === 'function' ? this._header(ctx) : this._header;
    return PythonRenderer.astToString({
      exports: this.getExports(ctx),
      exportsOptions: {
        preferExportAll: this._preferExportAll,
      },
      header,
      imports: this.getImports(ctx),
      nodes: ctx.file.nodes,
    });
  }

  supports(ctx: RenderContext): boolean {
    return ctx.file.language === 'python';
  }

  static astToString(args: {
    exports?: Exports;
    exportsOptions?: ExportsOptions;
    header?: Header;
    imports?: Imports;
    nodes?: ReadonlyArray<PyDsl>;
    /**
     * Whether to include a trailing newline at the end of the file.
     *
     * @default true
     */
    trailingNewline?: boolean;
  }): string {
    let text = '';
    for (const header of headerToLines(args.header)) {
      text += `${header}\n`;
    }

    const argsImports = args.imports ?? [];

    for (const group of args.exports ?? []) {
      for (const exp of group) {
        let found = false;
        for (const impGroup of argsImports) {
          if (found) break;
          for (const imp of impGroup) {
            if (imp.modulePath === exp.modulePath) {
              // TODO: merge imports and exports from the same module
              found = true;
              break;
            }
          }
        }
        if (!found) {
          argsImports.push([
            {
              imports: exp.exports.map((exp) => ({
                isTypeOnly: exp.isTypeOnly,
                localName: exp.exportedName,
                sourceName: exp.exportedName,
              })),
              isTypeOnly: false,
              kind: 'named',
              modulePath: exp.modulePath,
            },
          ]);
        }
      }
    }

    let imports = '';
    for (const group of argsImports) {
      if (imports) imports += '\n';
      for (const imp of group) {
        imports += `${astToString(PythonRenderer.toImportAst(imp))}`;
      }
    }
    text = `${text}${text && imports ? '\n' : ''}${imports}`;

    let exports = '';
    for (const group of args.exports ?? []) {
      if (exports) exports += '\n';
      for (const exp of group) {
        exports += `${astToString(PythonRenderer.toExportAst(exp, args.exportsOptions))}`;
      }
    }
    text = `${text}${text && exports ? '\n' : ''}${exports}`;

    let nodes = '';
    for (const node of args.nodes ?? []) {
      if (nodes) nodes += '\n\n';
      nodes += `${astToString(node.toAst())}`;
    }
    text = `${text}${text && nodes ? '\n\n' : ''}${nodes}`;

    if (args.trailingNewline === false && text.endsWith('\n')) {
      text = text.slice(0, -1);
    }

    return text;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static toExportAst(group: ModuleExport, options?: ExportsOptions): py.Assignment {
    const specifiers = group.exports.map((exp) => py.factory.createLiteral(exp.exportedName));
    return py.factory.createAssignment(
      py.factory.createIdentifier('__all__'),
      undefined,
      py.factory.createListExpression(specifiers),
    );
  }

  static toImportAst(group: ModuleImport): py.ImportStatement {
    const names: Array<{
      alias?: string;
      name: string;
    }> = group.imports.map((imp) => ({
      alias: imp.localName !== imp.sourceName ? imp.localName : undefined,
      name: imp.sourceName,
    }));
    return py.factory.createImportStatement(group.modulePath, names, group.imports.length > 0);
  }

  private getExports(ctx: RenderContext): Exports {
    type ModuleEntry = {
      group: ModuleExport;
      sortKey: SortKey;
    };

    const groups = new Map<SortGroup, Map<SortModule, ModuleEntry>>();

    for (const exp of ctx.file.exports) {
      const sortKey = moduleSortKey({
        file: ctx.file,
        fromFile: exp.from,
        preferFileExtension: this._preferFileExtension,
        root: ctx.project.root,
      });
      const modulePath = this._resolveModuleName?.(sortKey[2]) ?? sortKey[2];
      const [groupIndex] = sortKey;

      if (!groups.has(groupIndex)) groups.set(groupIndex, new Map());
      const moduleMap = groups.get(groupIndex)!;

      if (!moduleMap.has(modulePath)) {
        moduleMap.set(modulePath, {
          group: {
            canExportAll: exp.canExportAll,
            exports: exp.exports,
            isTypeOnly: exp.isTypeOnly,
            modulePath,
            namespaceExport: exp.namespaceExport,
          },
          sortKey,
        });
      }
    }

    const exports: Array<Array<ModuleExport>> = Array.from(groups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, moduleMap]) => {
        const entries = Array.from(moduleMap.values());

        entries.sort((a, b) => {
          const d = a.sortKey[1] - b.sortKey[1];
          return d !== 0 ? d : a.group.modulePath.localeCompare(b.group.modulePath);
        });

        return entries.map((e) => {
          const group = e.group;
          if (group.namespaceExport) {
            group.exports = [];
          } else {
            const isTypeOnly = !group.exports.find((exp) => !exp.isTypeOnly);
            if (isTypeOnly) {
              group.isTypeOnly = true;
              for (const exp of group.exports) {
                exp.isTypeOnly = false;
              }
            }
            group.exports.sort((a, b) => a.exportedName.localeCompare(b.exportedName));
          }
          return group;
        });
      });

    return exports;
  }

  private getImports(ctx: RenderContext): Imports {
    type ModuleEntry = {
      group: ModuleImport;
      sortKey: SortKey;
    };

    const groups = new Map<SortGroup, Map<SortModule, ModuleEntry>>();

    for (const imp of ctx.file.imports) {
      const sortKey = moduleSortKey({
        file: ctx.file,
        fromFile: imp.from,
        preferFileExtension: this._preferFileExtension,
        root: ctx.project.root,
      });
      const modulePath = this._resolveModuleName?.(sortKey[2]) ?? sortKey[2];
      const [groupIndex] = sortKey;

      if (!groups.has(groupIndex)) groups.set(groupIndex, new Map());
      const moduleMap = groups.get(groupIndex)!;

      if (!moduleMap.has(modulePath)) {
        moduleMap.set(modulePath, {
          group: {
            imports: [],
            isTypeOnly: false,
            kind: imp.kind,
            modulePath,
          },
          sortKey,
        });
      }

      const entry = moduleMap.get(modulePath)!;
      const group = entry.group;

      if (imp.kind !== 'named') {
        group.isTypeOnly = imp.isTypeOnly;
        group.kind = imp.kind;
        group.localName = imp.localName;
      } else {
        group.imports.push(...imp.imports);
      }
    }

    const imports: Array<Array<ModuleImport>> = Array.from(groups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, moduleMap]) => {
        const entries = Array.from(moduleMap.values());

        entries.sort((a, b) => {
          const d = a.sortKey[1] - b.sortKey[1];
          return d !== 0 ? d : a.group.modulePath.localeCompare(b.group.modulePath);
        });

        return entries.map((e) => {
          const group = e.group;
          if (group.kind === 'namespace') {
            group.imports = [];
          } else {
            const isTypeOnly = !group.imports.find((imp) => !imp.isTypeOnly);
            if (isTypeOnly) {
              group.isTypeOnly = true;
              for (const imp of group.imports) {
                imp.isTypeOnly = false;
              }
            }
            group.imports.sort((a, b) => a.localName.localeCompare(b.localName));
          }
          return group;
        });
      });

    return imports;
  }
}
