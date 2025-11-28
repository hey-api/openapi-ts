import type { SymbolImportKind } from '../symbols/types';

export interface PlannedImport {
  /** ID of the file where the symbol lives */
  from: number;
  /** The final exported name of the symbol in its source file */
  importedName: string;
  /** Whether this import is type-only. */
  isTypeOnly: boolean;
  /** Import flavor. */
  kind: SymbolImportKind;
  /**
   * The name this symbol will have locally in this file.
   * This is where aliasing is applied:
   *
   * import { Foo as Foo$2 } from "./x"
   *
   * localName === "Foo$2"
   */
  localName: string;
  /** ID of the symbol being imported */
  symbolId: number;
}

export interface PlannedExport {
  /**
   * Whether the export was explicitly requested by the plugin/DSL
   * (e.g. symbol.exported = true) vs implicitly required (e.g. re-export).
   */
  explicit: boolean;
  /**
   * The name this symbol will be exported under from this file.
   *
   * This may differ from the symbol's finalName if aliasing is needed:
   *
   * export { Foo as Foo2 }
   *
   * exportedName === "Foo2"
   */
  exportedName: string;
  /** Whether this export is type-only. */
  isTypeOnly: boolean;
  /** Export flavor. */
  kind: SymbolImportKind;
  /** ID of the symbol being exported */
  symbolId: number;
}

export interface PlannedReexport {
  /**
   * Name under which the symbol is exported in this file.
   *
   * export { Foo as Bar } from "./models"
   *
   * exportedName === "Bar"
   */
  exportedName: string;
  /** ID of the source file containing the symbol */
  from: number;
  /**
   * The name the symbol has in the source file’s exports.
   *
   * export { Foo as Bar } from "./models"
   *
   * importedName === "Foo"
   *
   * This handles aliasing in the source file's export list.
   */
  importedName: string;
  /** Whether this re-export is type-only. */
  isTypeOnly: boolean;
  /** Export flavor. */
  kind: SymbolImportKind;
  /** ID of the symbol being re-exported */
  symbolId: number;
}
