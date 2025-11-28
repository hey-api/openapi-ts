import type { File } from './files/file';
import type { BindingKind } from './symbols/types';

export interface ImportSingle {
  /** Whether this import is type-only. */
  isTypeOnly: boolean;
  /** Import flavor. */
  kind: BindingKind;
  /**
   * The name this symbol will have locally in this file.
   * This is where aliasing is applied:
   *
   * import { Foo as Foo$2 } from "./x"
   *
   * localName === "Foo$2"
   */
  localName: string;
  /** The exported name of the symbol in its source file. */
  sourceName: string;
}

export interface ExportSingle {
  /**
   * Name under which the symbol is exported in this file.
   *
   * export { Foo as Bar } from "./models"
   *
   * exportedName === "Bar"
   */
  exportedName: string;
  /** Whether this export is type-only. */
  isTypeOnly: boolean;
  /** Export flavor. */
  kind: BindingKind;
  /** The exported name of the symbol in its source file. */
  sourceName: string;
}

export type ExportGroup = Pick<ExportSingle, 'isTypeOnly'> & {
  /** Whether this module can export all symbols: `export * from 'module'`. */
  canExportAll: boolean;
  /** List of symbol exported from this module. */
  exports: Array<ExportSingle>;
  /** Source file. */
  from: File;
  /** Namespace export: `export * as ns from 'module'`. Mutually exclusive with `exports`. */
  namespaceExport?: string;
};

export type ImportGroup = Pick<ImportSingle, 'isTypeOnly'> & {
  /** Source file. */
  from: File;
  /** List of symbols imported from this module. */
  imports: Array<ImportSingle>;
  /** Namespace import: `import * as name from 'module'`. Mutually exclusive with `imports`. */
  namespaceImport?: string;
};
