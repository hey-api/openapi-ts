import type { ISymbolMeta } from '../extensions';
import { Symbol } from './symbol';
import type { ISymbolIdentifier, ISymbolIn, ISymbolRegistry } from './types';

type IndexEntry = [string, unknown];
type IndexKeySpace = ReadonlyArray<IndexEntry>;
type QueryCacheKey = string;
type SymbolId = number;

export class SymbolRegistry implements ISymbolRegistry {
  private _id: SymbolId = 0;
  private _indices: Map<IndexEntry[0], Map<IndexEntry[1], Set<SymbolId>>> =
    new Map();
  /**
   * @deprecated
   */
  private _nodes: Map<SymbolId, unknown> = new Map();
  private _queryCache: Map<QueryCacheKey, ReadonlyArray<SymbolId>> = new Map();
  private _queryCacheDependencies: Map<QueryCacheKey, Set<QueryCacheKey>> =
    new Map();
  private _registered: Set<SymbolId> = new Set();
  private _stubs: Set<SymbolId> = new Set();
  private _stubCache: Map<QueryCacheKey, SymbolId> = new Map();
  private _values: Map<SymbolId, Symbol> = new Map();

  get(identifier: ISymbolIdentifier): Symbol | undefined {
    return typeof identifier === 'number'
      ? this._values.get(identifier)
      : this.query(identifier)[0];
  }

  /**
   * @deprecated
   */
  getValue(symbolId: SymbolId): unknown {
    return this._nodes.get(symbolId);
  }

  isRegistered(identifier: ISymbolIdentifier): boolean {
    const symbol = this.get(identifier);
    return symbol ? this._registered.has(symbol.id) : false;
  }

  get nextId(): SymbolId {
    return this._id++;
  }

  query(filter: ISymbolMeta): ReadonlyArray<Symbol> {
    const cacheKey = this.buildCacheKey(filter);
    const cachedIds = this._queryCache.get(cacheKey);
    if (cachedIds) {
      return cachedIds.map((symbolId) => this._values.get(symbolId)!);
    }
    const sets: Array<Set<SymbolId>> = [];
    const indexKeySpace = this.buildIndexKeySpace(filter);
    const cacheDependencies = new Set<QueryCacheKey>();
    let missed = false;
    for (const indexEntry of indexKeySpace) {
      cacheDependencies.add(this.serializeIndexEntry(indexEntry));
      const values = this._indices.get(indexEntry[0]);
      if (!values) {
        missed = true;
        break;
      }
      const set = values.get(indexEntry[1]);
      if (!set) {
        missed = true;
        break;
      }
      sets.push(set);
    }
    if (missed || !sets.length) {
      this._queryCacheDependencies.set(cacheKey, cacheDependencies);
      this._queryCache.set(cacheKey, []);
      return [];
    }
    let result = new Set(sets[0]);
    for (const set of sets.slice(1)) {
      result = new Set([...result].filter((symbolId) => set.has(symbolId)));
    }
    const resultIds = [...result];
    this._queryCacheDependencies.set(cacheKey, cacheDependencies);
    this._queryCache.set(cacheKey, resultIds);
    return resultIds.map((symbolId) => this._values.get(symbolId)!);
  }

  reference(meta: ISymbolMeta): Symbol {
    const [registered] = this.query(meta);
    if (registered) return registered;

    const cacheKey = this.buildCacheKey(meta);
    const cachedId = this._stubCache.get(cacheKey);
    if (cachedId !== undefined) return this._values.get(cachedId)!;

    const stub = new Symbol({ meta, name: '' }, this.nextId);

    this._values.set(stub.id, stub);
    this._stubs.add(stub.id);
    this._stubCache.set(cacheKey, stub.id);
    return stub;
  }

  register(symbol: ISymbolIn): Symbol {
    const result = new Symbol(symbol, this.nextId);

    this._values.set(result.id, result);
    this._registered.add(result.id);

    if (result.meta) {
      const indexKeySpace = this.buildIndexKeySpace(result.meta);
      this.indexSymbol(result.id, indexKeySpace);
      this.invalidateCache(indexKeySpace);
      this.replaceStubs(result, indexKeySpace);
    }

    return result;
  }

  *registered(): IterableIterator<Symbol> {
    for (const id of this._registered.values()) {
      yield this._values.get(id)!;
    }
  }

  /**
   * @deprecated
   */
  setValue(symbolId: SymbolId, value: unknown): Map<SymbolId, unknown> {
    return this._nodes.set(symbolId, value);
  }

  private buildCacheKey(filter: ISymbolMeta): QueryCacheKey {
    const indexKeySpace = this.buildIndexKeySpace(filter);
    return indexKeySpace
      .map((indexEntry) => this.serializeIndexEntry(indexEntry))
      .sort() // ensure order-insensitivity
      .join('|');
  }

  private buildIndexKeySpace(meta: ISymbolMeta, prefix = ''): IndexKeySpace {
    const entries: Array<IndexEntry> = [];
    for (const [key, value] of Object.entries(meta)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        entries.push(...this.buildIndexKeySpace(value as ISymbolMeta, path));
      } else {
        entries.push([path, value]);
      }
    }
    return entries;
  }

  private indexSymbol(symbolId: SymbolId, indexKeySpace: IndexKeySpace): void {
    for (const [key, value] of indexKeySpace) {
      if (!this._indices.has(key)) this._indices.set(key, new Map());
      const values = this._indices.get(key)!;
      const set = values.get(value) ?? new Set();
      set.add(symbolId);
      values.set(value, set);
    }
  }

  private invalidateCache(indexKeySpace: IndexKeySpace): void {
    const changed = indexKeySpace.map((indexEntry) =>
      this.serializeIndexEntry(indexEntry),
    );
    for (const [
      cacheKey,
      cacheDependencies,
    ] of this._queryCacheDependencies.entries()) {
      for (const key of changed) {
        if (cacheDependencies.has(key)) {
          this._queryCacheDependencies.delete(cacheKey);
          this._queryCache.delete(cacheKey);
          break;
        }
      }
    }
  }

  private isSubset(sub: IndexKeySpace, sup: IndexKeySpace): boolean {
    const supMap = new Map(sup);
    for (const [key, value] of sub) {
      if (!supMap.has(key) || supMap.get(key) !== value) {
        return false;
      }
    }
    return true;
  }

  private replaceStubs(symbol: Symbol, indexKeySpace: IndexKeySpace): void {
    for (const stubId of this._stubs.values()) {
      const stub = this._values.get(stubId);
      if (
        stub?.meta &&
        this.isSubset(this.buildIndexKeySpace(stub.meta), indexKeySpace)
      ) {
        const cacheKey = this.buildCacheKey(stub.meta);
        this._stubCache.delete(cacheKey);
        this._stubs.delete(stubId);
        stub.setCanonical(symbol);
      }
    }
  }

  private serializeIndexEntry(indexEntry: IndexEntry): string {
    return `${indexEntry[0]}:${JSON.stringify(indexEntry[1])}`;
  }
}
