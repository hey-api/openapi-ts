import type { ISymbolMeta } from '../extensions/types';
import type { ISelector } from '../selectors/types';

export interface ISymbolIn {
  /**
   * Array of file names (without extensions) from which this symbol is re-exported.
   *
   * @default undefined
   */
  readonly exportFrom?: ReadonlyArray<string>;
  /**
   * Whether this symbol is exported from its own file.
   *
   * @default false
   */
  readonly exported?: boolean;
  /**
   * External module name if this symbol is imported from a module not managed
   * by the project (e.g. "zod", "lodash").
   *
   * @default undefined
   */
  readonly external?: string;
  /**
   * Optional output strategy to override default behavior.
   *
   * @returns The file path to output the symbol to, or undefined to fallback to default behavior.
   */
  readonly getFilePath?: (symbol: ISymbolOut) => string | undefined;
  /**
   * Unique symbol ID. If one is not provided, it will be auto-generated.
   */
  readonly id?: number;
  /**
   * Arbitrary metadata about the symbol.
   *
   * @default undefined
   */
  readonly meta?: ISymbolMeta & {
    /**
     * Kind of import if this symbol represents an import.
     */
    importKind?: 'namespace' | 'default' | 'named';
    /**
     * Kind of symbol.
     */
    kind?: 'type';
  };
  /**
   * The desired name for the symbol within its file. If there are multiple symbols
   * with the same desired name, this might not end up being the actual name.
   *
   * @example "UserModel"
   */
  readonly name?: string;
  /**
   * Placeholder name for the symbol to be replaced later with the final value.
   *
   * @example "_heyapi_31_"
   */
  readonly placeholder?: string;
  /**
   * Selector array used to select this symbol. It doesn't have to be
   * unique, but in practice it might be desirable.
   *
   * @example ["zod", "#/components/schemas/Foo"]
   */
  readonly selector?: ISelector;
}

export interface ISymbolOut extends ISymbolIn {
  /**
   * Array of file names (without extensions) from which this symbol is re-exported.
   */
  readonly exportFrom: ReadonlyArray<string>;
  /**
   * Unique symbol ID.
   */
  readonly id: number;
  /**
   * Placeholder name for the symbol to be replaced later with the final value.
   *
   * @example "_heyapi_31_"
   */
  readonly placeholder: string;
}

export interface ISymbolRegistry {
  /**
   * Get a symbol by its ID.
   *
   * @param symbolIdOrSelector Symbol ID or selector to reference.
   * @returns The symbol, or undefined if not found.
   */
  get(symbolIdOrSelector: number | ISelector): ISymbolOut | undefined;
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
   * Returns a symbol by ID or selector, registering it if it doesn't exist.
   *
   * @param symbolIdOrSelector Symbol ID or selector to reference.
   * @returns The referenced or newly registered symbol.
   */
  reference(symbolIdOrSelector: number | ISelector): ISymbolOut;
  /**
   * Register a symbol globally.
   *
   * Deduplicates identical symbols by ID.
   *
   * @param symbol Symbol to register.
   * @returns The registered symbol.
   */
  register(symbol: ISymbolIn): ISymbolOut;
  /**
   * Get all symbols in the order they were registered.
   *
   * @returns Array of all registered symbols, in insert order.
   */
  registered(): IterableIterator<ISymbolOut>;
  /**
   * Sets a value for a symbol by its ID.
   *
   * @param symbolId Symbol ID.
   * @param value The value to set.
   * @returns void
   */
  setValue(symbolId: number, value: unknown): Map<number, unknown>;
}
