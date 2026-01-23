import type { ISymbolMeta } from '../extensions';
import type { Symbol } from './symbol';

export type BindingKind = 'default' | 'named' | 'namespace';

export type ISymbolIdentifier = number | ISymbolMeta;

export type SymbolKind =
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
   *
   * @default 'named'
   */
  importKind?: BindingKind;
  /**
   * Kind of symbol.
   *
   * @default 'var'
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
   * Returns whether a symbol is registered in the registry.
   *
   * @param identifier Symbol identifier to check.
   * @returns True if the symbol is registered, false otherwise.
   */
  isRegistered(identifier: ISymbolIdentifier): boolean;
  /**
   * Returns the current symbol ID and increments it.
   *
   * @returns Symbol ID before being incremented.
   */
  readonly nextId: number;
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
}
