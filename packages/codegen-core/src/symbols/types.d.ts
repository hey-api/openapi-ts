import type { ISymbolMeta } from '../extensions';
import type { Symbol } from './symbol';

export type ISymbolIdentifier = number | ISymbolMeta;

export type SymbolImportKind = 'namespace' | 'default' | 'named';

export type SymbolKind =
  | 'alias' // export { a as a2 } from 'a';
  | 'class'
  | 'enum'
  | 'function'
  | 'interface'
  | 'namespace'
  | 'type'
  | 'var';

export type ISymbolIn = {
  /**
   * Array of file names (without extensions) from which this symbol is re-exported.
   *
   * @default undefined
   */
  exportFrom?: ReadonlyArray<string>;
  /**
   * Whether this symbol is exported from its own file.
   *
   * @default false
   */
  exported?: boolean;
  /**
   * External module name if this symbol is imported from a module not managed
   * by the project (e.g. "zod", "lodash").
   *
   * @default undefined
   */
  external?: string;
  /**
   * Optional output strategy to override default behavior.
   *
   * @returns The file path to output the symbol to, or undefined to fallback to default behavior.
   */
  getFilePath?: Symbol['getFilePath'];
  /**
   * Kind of import if this symbol represents an import.
   */
  importKind?: SymbolImportKind;
  /**
   * Kind of symbol.
   */
  kind?: SymbolKind;
  /**
   * Arbitrary metadata about the symbol.
   *
   * @default undefined
   */
  meta?: ISymbolMeta;
  /**
   * The intended, user-facing name of the symbol before any conflict resolution.
   * It is **not** guaranteed to be the final emitted name — aliasing may occur if the
   * file contains conflicting local identifiers or other symbols with the same intended name.
   *
   * @example "UserModel"
   */
  name: string;
  /**
   * Placeholder name for the symbol to be replaced later with the final value.
   *
   * @deprecated
   * @example "_heyapi_31_"
   */
  readonly placeholder?: string;
};

export interface ISymbolRegistry {
  /**
   * Get a symbol.
   *
   * @param identifier Symbol identifier to reference.
   * @returns The symbol, or undefined if not found.
   */
  get(identifier: ISymbolIdentifier): Symbol | undefined;
  /**
   * Returns the value associated with a symbol ID.
   *
   * @param symbolId Symbol ID.
   * @return The value associated with the symbol ID, or undefined if not found.
   */
  getValue(symbolId: number): unknown;
  /**
   * Checks if the registry has a value associated with a symbol ID.
   *
   * @param symbolId Symbol ID.
   * @returns True if the registry has a value for symbol ID, false otherwise.
   */
  hasValue(symbolId: number): boolean;
  /**
   * Returns the current symbol ID and increments it.
   *
   * @returns Symbol ID before being incremented.
   */
  readonly id: number;
  /**
   * Returns whether a symbol is registered in the registry.
   *
   * @param identifier Symbol identifier to check.
   * @returns True if the symbol is registered, false otherwise.
   */
  isRegistered(identifier: ISymbolIdentifier): boolean;
  /**
   * Queries symbols by metadata filter.
   *
   * @param filter Metadata filter to query symbols by.
   * @returns Array of symbols matching the filter.
   */
  query(filter: ISymbolMeta): ReadonlyArray<Symbol>;
  /**
   * References a symbol.
   *
   * @param meta Metadata filter to reference symbol by.
   * @returns The referenced symbol.
   */
  reference(meta: ISymbolMeta): Symbol;
  /**
   * Register a symbol globally.
   *
   * Deduplicates identical symbols by ID.
   *
   * @param symbol Symbol to register.
   * @returns The registered symbol.
   */
  register(symbol: ISymbolIn): Symbol;
  /**
   * Get all symbols in the order they were registered.
   *
   * @returns Array of all registered symbols, in insert order.
   */
  registered(): IterableIterator<Symbol>;
  /**
   * Sets a value for a symbol by its ID.
   *
   * @param symbolId Symbol ID.
   * @param value The value to set.
   * @returns void
   */
  setValue(symbolId: number, value: unknown): Map<number, unknown>;
}
