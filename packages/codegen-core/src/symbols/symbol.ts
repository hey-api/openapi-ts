import { debug } from '../debug';
import type { ISymbolMeta } from '../extensions';
import type { IFileOut } from '../files/types';
import type { INode } from '../nodes/node';
import { wrapId } from '../renderer/utils';
import type { ISymbolIn, SymbolImportKind, SymbolKind } from './types';

export const symbolBrand = globalThis.Symbol('symbol');

export class Symbol {
  /**
   * Canonical symbol this stub resolves to, if any.
   *
   * Stubs created during DSL construction may later be associated
   * with a fully registered symbol. Once set, all property lookups
   * should defer to the canonical symbol.
   *
   * @private
   */
  private _canonical?: Symbol;
  /**
   * Private set of direct symbol dependencies.
   *
   * @private
   */
  private readonly _dependencies = new Set<Symbol>();
  /**
   * True if this symbol is exported from its defining file.
   *
   * @default false
   */
  private _exported: boolean;
  /**
   * Names of files (without extension) from which this symbol is re-exported.
   *
   * @default []
   */
  private _exportFrom: ReadonlyArray<string>;
  /**
   * External module name if this symbol is imported from a module not managed
   * by the project (e.g. "zod", "lodash").
   *
   * @default undefined
   */
  private _external?: string;
  /**
   * The file this symbol is ultimately emitted into.
   *
   * @private
   */
  private _file?: IFileOut;
  /**
   * The alias-resolved, conflict-free emitted name.
   */
  _finalName?: string;
  /**
   * Custom strategy to determine file output path.
   *
   * @returns The file path to output the symbol to, or undefined to fallback to default behavior.
   */
  private _getFilePath?: (symbol: Symbol) => string | undefined;
  /**
   * How this symbol should be imported (namespace/default/named).
   *
   * @default 'named'
   */
  private _importKind: SymbolImportKind;
  /**
   * Kind of symbol (class, type, alias, etc.).
   *
   * @default 'var'
   */
  private _kind: SymbolKind;
  /**
   * Arbitrary user metadata.
   *
   * @default undefined
   */
  private _meta?: ISymbolMeta;
  /**
   * Intended user-facing name before conflict resolution.
   *
   * @example "UserModel"
   */
  private _name: string;
  /**
   * Node that defines this symbol.
   *
   * @private
   */
  private _node?: INode;

  /** Brand used for identifying symbols. */
  readonly '~brand': symbol = symbolBrand;
  /**
   * Globally unique, stable symbol ID.
   */
  readonly id: number;
  /**
   * Placeholder name for the symbol to be replaced later with the final value.
   *
   * @deprecated
   * @example "_heyapi_31_"
   */
  readonly placeholder: string;

  constructor(input: ISymbolIn, id: number) {
    this._exported = input.exported ?? false;
    this._exportFrom = input.exportFrom ?? [];
    this._external = input.external;
    this._getFilePath = input.getFilePath;
    this.id = id;
    this._importKind = input.importKind ?? 'named';
    this._kind = input.kind ?? 'var';
    this._meta = input.meta;
    this._name = input.name;
    this.placeholder = input.placeholder || wrapId(String(id));
  }

  /**
   * Returns the canonical symbol for this instance.
   *
   * If this symbol was created as a stub, this getter returns
   * the fully registered canonical symbol. Otherwise, it returns
   * the symbol itself.
   */
  get canonical(): Symbol {
    return this._canonical ?? this;
  }

  /**
   * Read-only access to dependencies.
   */
  get dependencies(): ReadonlySet<Symbol> {
    return this.canonical._dependencies;
  }

  /**
   * Indicates whether this symbol is exported from its defining file.
   */
  get exported(): boolean {
    return this.canonical._exported;
  }

  /**
   * Names of files (without extension) that re-export this symbol.
   */
  get exportFrom(): ReadonlyArray<string> {
    return this.canonical._exportFrom;
  }

  /**
   * External module from which this symbol originates, if any.
   */
  get external(): string | undefined {
    return this.canonical._external;
  }

  /**
   * Read‑only accessor for the assigned output file.
   */
  get file(): IFileOut | undefined {
    return this.canonical._file;
  }

  /**
   * Read‑only accessor for the resolved final emitted name.
   */
  get finalName(): string {
    return (
      this.canonical._finalName ||
      this.canonical.placeholder ||
      this.canonical.name
    );
  }

  /**
   * Custom file path resolver, if provided.
   */
  get getFilePath(): ((symbol: Symbol) => string | undefined) | undefined {
    return this.canonical._getFilePath;
  }

  /**
   * How this symbol should be imported (named/default/namespace).
   */
  get importKind(): SymbolImportKind {
    return this.canonical._importKind;
  }

  /**
   * The symbol's kind (class, type, alias, variable, etc.).
   */
  get kind(): SymbolKind {
    return this.canonical._kind;
  }

  /**
   * Arbitrary user‑provided metadata associated with this symbol.
   */
  get meta(): ISymbolMeta | undefined {
    return this.canonical._meta;
  }

  /**
   * User-intended name before aliasing or conflict resolution.
   */
  get name(): string {
    return this.canonical._name;
  }

  /**
   * Read‑only accessor for the defining node.
   */
  get node(): INode | undefined {
    return this.canonical._node;
  }

  /**
   * Add a direct dependency on another symbol.
   */
  addDependency(symbol: Symbol): void {
    this.assertCanonical();
    if (symbol !== this) this._dependencies.add(symbol);
  }

  /**
   * Marks this symbol as a stub and assigns its canonical symbol.
   *
   * After calling this, all semantic queries (name, kind, file,
   * meta, etc.) should reflect the canonical symbol's values.
   *
   * @param symbol — The canonical symbol this stub should resolve to.
   */
  setCanonical(symbol: Symbol): void {
    this._canonical = symbol;
  }

  /**
   * Marks the symbol as exported from its file.
   *
   * @param exported — Whether the symbol is exported.
   */
  setExported(exported: boolean): void {
    this.assertCanonical();
    this._exported = exported;
  }

  /**
   * Records file names that re‑export this symbol.
   *
   * @param list — Source files re‑exporting this symbol.
   */
  setExportFrom(list: ReadonlyArray<string>): void {
    this.assertCanonical();
    this._exportFrom = list;
  }

  /**
   * Assigns the output file this symbol will be emitted into.
   *
   * This may only be set once.
   */
  setFile(file: IFileOut): void {
    this.assertCanonical();
    if (this._file && this._file !== file) {
      throw new Error('Symbol is already assigned to a different file.');
    }
    this._file = file;
  }

  /**
   * Assigns the conflict‑resolved final local name for this symbol.
   *
   * This may only be set once.
   */
  setFinalName(name: string): void {
    this.assertCanonical();
    if (this._finalName && this._finalName !== name) {
      throw new Error('Symbol finalName has already been resolved.');
    }
    this._finalName = name;
  }

  /**
   * Sets how this symbol should be imported.
   *
   * @param kind — The import strategy (named/default/namespace).
   */
  setImportKind(kind: SymbolImportKind): void {
    this.assertCanonical();
    this._importKind = kind;
  }

  /**
   * Sets the symbol's kind (class, type, alias, variable, etc.).
   *
   * @param kind — The new symbol kind.
   */
  setKind(kind: SymbolKind): void {
    this.assertCanonical();
    this._kind = kind;
  }

  /**
   * Updates the intended user‑facing name for this symbol.
   *
   * @param name — The new name.
   */
  setName(name: string): void {
    this.assertCanonical();
    this._name = name;
  }

  /**
   * Binds the node that defines this symbol.
   *
   * This may only be set once.
   */
  setNode(node: INode): void {
    this.assertCanonical();
    if (this._node && this._node !== node) {
      throw new Error('Symbol is already bound to a different node.');
    }
    this._node = node;
    node.symbol = this;
  }

  /**
   * Returns a debug‑friendly string representation identifying the symbol.
   */
  toString(): string {
    return `[Symbol ${this.name}#${this.id}]`;
  }

  /**
   * Ensures this symbol is canonical before allowing mutation.
   *
   * A symbol that has been marked as a stub (i.e., its `_canonical` points
   * to a different symbol) may not be mutated. This guard throws an error
   * if any setter attempts to modify a stub, preventing accidental writes
   * to non‑canonical instances.
   *
   * @throws {Error} If the symbol is a stub and is being mutated.
   * @private
   */
  private assertCanonical(): void {
    if (this._canonical && this._canonical !== this) {
      const message = `Illegal mutation of stub symbol ${this.toString()} → canonical: ${this._canonical.toString()}`;
      debug(message, 'symbol');
      throw new Error(message);
    }
  }
}

export function isSymbol(value: unknown): value is Symbol {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as { '~brand'?: unknown };
  return obj['~brand'] === symbolBrand && Object.hasOwn(obj, '~brand');
}
