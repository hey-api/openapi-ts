/**
 * Bi-directional map interface.
 *
 * Keys map to values and values map back to keys.
 *
 * @template Key Type of the map keys
 * @template Value Type of the map values
 */
export interface IBiMap<Key, Value> {
  /**
   * Deletes a key and its associated value from the map.
   *
   * @param key The key to delete.
   */
  delete(key: Key): boolean;
  /**
   * Deletes a value and its associated key from the map.
   *
   * @param value The value to delete.
   */
  deleteValue(value: Value): boolean;
  /**
   * Returns an iterator of [key, value] pairs.
   */
  entries(): IterableIterator<[Key, Value]>;
  /**
   * Gets the value associated with a key.
   *
   * @param key The key to look up.
   */
  get(key: Key): Value | undefined;
  /**
   * Gets the key associated with a value.
   *
   * @param value The value to look up.
   */
  getKey(value: Value): Key | undefined;
  /**
   * Checks if a key exists in the map.
   *
   * @param key The key to check.
   */
  hasKey(key: Key): boolean;
  /**
   * Checks if a value exists in the map.
   *
   * @param value The value to check.
   */
  hasValue(value: Value): boolean;
  /**
   * Returns an iterator of keys.
   */
  keys(): IterableIterator<Key>;
  /**
   * Sets a key-value pair in the map.
   *
   * @param key The key.
   * @param value The value.
   * @returns This instance for chaining.
   */
  set(key: Key, value: Value): this;
  /**
   * Number of key-value pairs in the map.
   */
  readonly size: number;
  /**
   * Returns an iterator of values.
   */
  values(): IterableIterator<Value>;
  /**
   * Enables iteration with `for...of`.
   */
  [Symbol.iterator](): IterableIterator<[Key, Value]>;
}
