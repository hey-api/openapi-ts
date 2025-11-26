import type { IBiMap } from '../bimap/types';
import type {
  PlannedExport,
  PlannedImport,
  PlannedReexport,
} from '../bindings/plan';
import type { Symbol } from '../symbols/symbol';
import type { SymbolKind } from '../symbols/types';
import type { Rules } from './rules';

/**
 * Selector array used to reference files.
 *
 * @example ["foo", "bar"]
 */
export type IFileSelector = ReadonlyArray<string>;

export type IFileIdentifier = number | IFileSelector;

export type IFileIn = {
  /** File extension, if any. */
  extension?: string;
  /**
   * Indicates whether the file is external, meaning it is not generated
   * as part of the project but is referenced (e.g., a module from
   * node_modules).
   *
   * @example true
   */
  external?: boolean;
  /** Unique file ID. If one is not provided, it will be auto-generated. */
  readonly id?: number;
  /**
   * The desired name for the file within the project. If there are multiple files
   * with the same desired name, this might not end up being the actual name.
   *
   * @example "UserModel"
   */
  name?: string;
  /**
   * Absolute logical output path for the file.
   *
   * @example "/src/models/user.ts"
   */
  path?: string;
  /**
   * Selector array used to select this file.
   *
   * @example ["foo", "bar"]
   */
  readonly selector?: IFileSelector;
};

export type IFileOut = IFileIn & {
  /** Named exports originating from this file */
  readonly exports: Array<PlannedExport>;
  /** Unique file ID. */
  readonly id: number;
  /** Fully resolved imports this file needs */
  readonly imports: Array<PlannedImport>;
  /** Re-exports (“export { X } from …”) */
  readonly reexports: Array<PlannedReexport>;
  /** Top-level names in this file that cannot be reused (imports, exports, declarations, symbol names). */
  readonly reservedNames: Map<string, Set<SymbolKind>>;
  /** Map holding resolved names for symbols in this file. */
  readonly resolvedNames: IBiMap<number, string>;
  /** Rules that control naming, imports, reexports, and scope behavior for this file. */
  rules?: Rules;
  /** Symbols defined inside this file */
  readonly symbols: Array<Symbol>;
};

export interface IFileRegistry {
  /**
   * Get a file.
   *
   * @param identifier File identifier to reference.
   * @returns The file, or undefined if not found.
   */
  get(identifier: IFileIdentifier): IFileOut | undefined;
  /**
   * Returns the current file ID and increments it.
   *
   * @returns File ID before being incremented
   */
  readonly id: number;
  /**
   * Returns whether a file is registered in the registry.
   *
   * @param identifier File identifier to check.
   * @returns True if the file is registered, false otherwise.
   */
  isRegistered(identifier: IFileIdentifier): boolean;
  /**
   * Returns a file by identifier, registering it if it doesn't exist.
   *
   * @param identifier File identifier to reference.
   * @returns The referenced or newly registered file.
   */
  reference(identifier: IFileIdentifier): IFileOut;
  /**
   * Get all unregistered files in the order they were referenced.
   *
   * @returns Array of all unregistered files, in reference order.
   */
  referenced(): IterableIterator<IFileOut>;
  /**
   * Register a file globally.
   *
   * Deduplicates identical files by ID.
   *
   * @param file File to register.
   * @returns true if added, false if duplicate.
   */
  register(file: IFileIn): IFileOut;
  /**
   * Get all files in the order they were registered.
   *
   * @returns Array of all registered files, in insert order.
   */
  registered(): IterableIterator<IFileOut>;
}
