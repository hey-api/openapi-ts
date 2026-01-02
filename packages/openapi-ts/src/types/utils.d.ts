/**
 * Converts all top-level ReadonlyArray properties to Array (shallow).
 */
export type ArrayOnly<T> = {
  [K in keyof T]: T[K] extends ReadonlyArray<infer U> ? Array<U> : T[K];
};

/**
 * Recursively makes all non-function properties optional.
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: Array<any>) => any
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/**
 * Accepts a value, a function returning a value, or a function returning a promise of a value.
 */
export type LazyOrAsync<T> = T | (() => T) | (() => Promise<T>);

/**
 * Accepts a value or a readonly array of values of type T.
 */
export type MaybeArray<T> = T | ReadonlyArray<T>;

/**
 * Accepts a value or a function returning a value.
 */
export type MaybeFunc<T extends (...args: Array<any>) => any> =
  | T
  | ReturnType<T>;

/**
 * Converts all top-level Array properties to ReadonlyArray (shallow).
 */
export type ReadonlyArrayOnly<T> = {
  [K in keyof T]: T[K] extends Array<infer U> ? ReadonlyArray<U> : T[K];
};
