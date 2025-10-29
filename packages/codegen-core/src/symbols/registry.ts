import type { ISymbolMeta } from '../extensions/types';
import { wrapId } from '../renderer/utils';
import type {
  ISymbolIdentifier,
  ISymbolIn,
  ISymbolOut,
  ISymbolRegistry,
} from './types';

type IndexEntry = [string, unknown];
type IndexKeySpace = ReadonlyArray<IndexEntry>;
type QueryCacheKey = string;
type SymbolId = number;

export class SymbolRegistry implements ISymbolRegistry {
  private _id: SymbolId = 0;
  private indices: Map<IndexEntry[0], Map<IndexEntry[1], Set<SymbolId>>> =
    new Map();
  private nodes: Map<SymbolId, unknown> = new Map();
  private queryCache: Map<QueryCacheKey, ReadonlyArray<SymbolId>> = new Map();
  private queryCacheDependencies: Map<QueryCacheKey, Set<QueryCacheKey>> =
    new Map();
  private registerOrder: Set<SymbolId> = new Set();
  // TODO: remove after removing selectors
  private selectorToId: Map<string, SymbolId> = new Map();
  private stubCache: Map<QueryCacheKey, SymbolId> = new Map();
  private stubs: Set<SymbolId> = new Set();
  private values: Map<SymbolId, ISymbolOut> = new Map();

  get(identifier: ISymbolIdentifier): ISymbolOut | undefined {
    const symbol = this.identifierToSymbol(identifier);

    if (symbol.id !== undefined) {
      return this.values.get(symbol.id);
    }

    // TODO: remove after removing selectors
    const selector =
      symbol.selector !== undefined
        ? JSON.stringify(symbol.selector)
        : undefined;

    // TODO: remove after removing selectors
    if (selector) {
      const id = this.selectorToId.get(selector);
      if (id !== undefined) {
        return this.values.get(id);
      }
    }

    if (symbol.meta) {
      return this.query(symbol.meta)[0];
    }

    return;
  }

  getValue(symbolId: SymbolId): unknown {
    return this.nodes.get(symbolId);
  }

  hasValue(symbolId: SymbolId): boolean {
    return this.nodes.has(symbolId);
  }

  get id(): SymbolId {
    return this._id++;
  }

  isRegistered(identifier: ISymbolIdentifier): boolean {
    const symbol = this.get(identifier);
    return symbol ? this.registerOrder.has(symbol.id) : false;
  }

  query(filter: ISymbolMeta): ReadonlyArray<ISymbolOut> {
    const cacheKey = this.buildCacheKey(filter);
    const cachedIds = this.queryCache.get(cacheKey);
    if (cachedIds) {
      return cachedIds.map((symbolId) => this.values.get(symbolId)!);
    }
    const sets: Array<Set<SymbolId>> = [];
    const indexKeySpace = this.buildIndexKeySpace(filter);
    const cacheDependencies = new Set<QueryCacheKey>();
    let missed = false;
    for (const indexEntry of indexKeySpace) {
      cacheDependencies.add(this.serializeIndexEntry(indexEntry));
      const values = this.indices.get(indexEntry[0]);
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
      this.queryCacheDependencies.set(cacheKey, cacheDependencies);
      this.queryCache.set(cacheKey, []);
      return [];
    }
    let result = new Set(sets[0]);
    for (const set of sets.slice(1)) {
      result = new Set([...result].filter((symbolId) => set.has(symbolId)));
    }
    const resultIds = [...result];
    this.queryCacheDependencies.set(cacheKey, cacheDependencies);
    this.queryCache.set(cacheKey, resultIds);
    return resultIds.map((symbolId) => this.values.get(symbolId)!);
  }

  reference(identifier: ISymbolIdentifier): ISymbolOut {
    const symbol = this.identifierToSymbol(identifier);
    if (!symbol.meta) {
      // TODO: remove/refactor after removing selectors
      return this.register(symbol);
    }
    const [registered] = this.query(symbol.meta);
    if (registered) return registered;
    const cacheKey = this.buildCacheKey(symbol.meta);
    const cachedId = this.stubCache.get(cacheKey);
    if (cachedId !== undefined) return this.values.get(cachedId)!;
    const id = this.id;
    const stub: ISymbolOut = {
      exportFrom: [],
      id,
      meta: symbol.meta,
      placeholder: wrapId(String(id)),
    };
    this.values.set(stub.id, stub);
    this.stubs.add(stub.id);
    this.stubCache.set(cacheKey, stub.id);
    return stub;
  }

  register(symbol: ISymbolIn): ISymbolOut {
    // TODO: refactor after removing selectors
    if (symbol.id !== undefined) {
      const result = this.values.get(symbol.id);
      if (!result) {
        throw new Error(
          `Symbol with ID ${symbol.id} not found. To register a new symbol, leave the ID undefined.`,
        );
      }
      return result;
    }

    // TODO: refactor after removing selectors
    const hasOtherKeys = Object.keys(symbol).some(
      (key) => !['id', 'meta', 'selector'].includes(key),
    );

    let result: ISymbolOut | undefined;

    // TODO: remove after removing selectors
    const selector =
      symbol.selector !== undefined
        ? JSON.stringify(symbol.selector)
        : undefined;
    if (selector) {
      const id = this.selectorToId.get(selector);
      if (id !== undefined) {
        result = this.values.get(id);
        if (!result) {
          throw new Error(
            `Symbol with ID ${id} not found. The selector ${selector} matched an ID, but there was no result. This is likely an issue with the application logic.`,
          );
        }
        if (!hasOtherKeys) {
          return result;
        }
      }
    }

    const id = result?.id !== undefined ? result.id : this.id;
    const exportFrom: Array<string> = result?.exportFrom
      ? [...result.exportFrom]
      : [];
    if (symbol.exportFrom) {
      exportFrom.push(...symbol.exportFrom);
    }
    result = {
      ...result,
      ...symbol, // clone to avoid mutation
      exportFrom,
      id,
      placeholder:
        result?.placeholder ?? symbol.placeholder ?? wrapId(String(id)),
    };
    this.values.set(result.id, result);

    if (hasOtherKeys) {
      this.registerOrder.add(result.id);
    }

    if (selector) {
      // TODO: remove after removing selectors
      this.selectorToId.set(selector, result.id);
    }

    if (result.meta) {
      const indexKeySpace = this.buildIndexKeySpace(result.meta);
      this.indexSymbol(result.id, indexKeySpace);
      this.invalidateCache(indexKeySpace);
      this.replaceStubs(result, indexKeySpace);
    }

    return result;
  }

  *registered(): IterableIterator<ISymbolOut> {
    for (const id of this.registerOrder.values()) {
      yield this.values.get(id)!;
    }
  }

  setValue(symbolId: SymbolId, value: unknown): Map<SymbolId, unknown> {
    return this.nodes.set(symbolId, value);
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

  private identifierToSymbol(
    identifier: ISymbolIdentifier,
  ): Pick<ISymbolIn, 'id' | 'meta' | 'selector'> {
    if (typeof identifier === 'number') {
      return { id: identifier };
    }
    if (identifier instanceof Array) {
      // TODO: remove after removing selectors
      return { selector: identifier };
    }
    return { meta: identifier };
  }

  private indexSymbol(symbolId: SymbolId, indexKeySpace: IndexKeySpace): void {
    for (const [key, value] of indexKeySpace) {
      if (!this.indices.has(key)) this.indices.set(key, new Map());
      const values = this.indices.get(key)!;
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
    ] of this.queryCacheDependencies.entries()) {
      for (const key of changed) {
        if (cacheDependencies.has(key)) {
          this.queryCacheDependencies.delete(cacheKey);
          this.queryCache.delete(cacheKey);
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

  private replaceStubs(symbol: ISymbolOut, indexKeySpace: IndexKeySpace): void {
    for (const stubId of this.stubs.values()) {
      const stub = this.values.get(stubId);
      if (
        stub?.meta &&
        this.isSubset(this.buildIndexKeySpace(stub.meta), indexKeySpace)
      ) {
        const cacheKey = this.buildCacheKey(stub.meta);
        this.stubCache.delete(cacheKey);
        this.values.set(stubId, Object.assign(stub, symbol));
        this.stubs.delete(stubId);
      }
    }
  }

  private serializeIndexEntry(indexEntry: IndexEntry): string {
    return `${indexEntry[0]}:${JSON.stringify(indexEntry[1])}`;
  }
}
