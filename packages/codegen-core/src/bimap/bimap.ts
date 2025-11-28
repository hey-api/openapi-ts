import type { IBiMap } from './types';

export class BiMap<Key, Value> implements IBiMap<Key, Value> {
  private map = new Map<Key, Value>();
  private reverse = new Map<Value, Set<Key>>();

  delete(key: Key): boolean {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.reverse.delete(value);
    }
    return this.map.delete(key);
  }

  deleteValue(value: Value): boolean {
    const keys = this.reverse.get(value);
    if (keys) {
      for (const key of keys) {
        this.map.delete(key);
      }
    }
    return this.reverse.delete(value);
  }

  entries(): IterableIterator<[Key, Value]> {
    return this.map.entries();
  }

  get(key: Key): Value | undefined {
    return this.map.get(key);
  }

  getKeys(value: Value): Set<Key> | undefined {
    return this.reverse.get(value);
  }

  hasKey(key: Key): boolean {
    return this.map.has(key);
  }

  hasValue(value: Value): boolean {
    return this.reverse.has(value);
  }

  keys(): IterableIterator<Key> {
    return this.map.keys();
  }

  set(key: Key, value: Value): this {
    const oldValue = this.map.get(key);
    if (oldValue !== undefined && oldValue !== value) {
      const oldKeys = this.reverse.get(oldValue);
      if (oldKeys) {
        oldKeys.delete(key);
        if (oldKeys.size === 0) {
          this.reverse.delete(oldValue);
        }
      }
    }
    this.map.set(key, value);
    const keys = this.reverse.get(value) ?? new Set<Key>();
    keys.add(key);
    this.reverse.set(value, keys);
    return this;
  }

  get size(): number {
    return this.map.size;
  }

  values(): IterableIterator<Value> {
    return this.map.values();
  }

  [Symbol.iterator](): IterableIterator<[Key, Value]> {
    return this.map[Symbol.iterator]();
  }
}
