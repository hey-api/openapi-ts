/**
 * An object with string keys and unknown values.
 */
export type AnyObject = Record<string, unknown>;

/**
 * Converts all top-level ReadonlyArray properties to Array (shallow).
 */
export type ArrayOnly<T> = {
  [K in keyof T]: ToArray<T[K]>;
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
export type LazyOrAsync<T> = T | (() => MaybePromise<T>);

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
 * Accepts a value or a promise of a value.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Converts all top-level Array properties to ReadonlyArray (shallow).
 */
export type ReadonlyArrayOnly<T> = {
  [K in keyof T]: ToReadonlyArray<T[K]>;
};

/**
 * Converts ReadonlyArray<T> to Array<T>, preserving unions.
 */
export type ToArray<T> = T extends ReadonlyArray<infer U> ? Array<U> : T;

/**
 * Converts Array<T> to ReadonlyArray<T>, preserving unions.
 */
export type ToReadonlyArray<T> =
  T extends ReadonlyArray<infer U> ? ReadonlyArray<U> : T;
