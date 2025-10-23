/**
 * Ref wrapper which ensures a stable reference for a value.
 *
 * @example
 * ```ts
 * type NumRef = Ref<number>; // { value: number }
 * const num: NumRef = { value: 42 };
 * console.log(num.value); // 42
 * ```
 */
type Ref<T> = { value: T };

/**
 * Utility type: wraps a value in a Ref.
 *
 * @example
 * ```ts
 * type R = ToRef<number>; // { value: number }
 * ```
 */
export type ToRef<T> = Ref<T>;

/**
 * Utility type: unwraps a Ref to its value type.
 * @example
 * ```ts
 * type N = FromRef<{ value: number }>; // number
 * ```
 */
export type FromRef<T> = T extends Ref<infer V> ? V : T;

/**
 * Maps every property of a Ref-wrapped object back to its plain value.
 *
 * @example
 * ```ts
 * type Foo = { a: number; b: string };
 * type Refs = ToRefs<Foo>; // { a: Ref<number>; b: Ref<string> }
 * type Foo2 = FromRefs<Refs>; // { a: number; b: string }
 * ```
 */
export type FromRefs<T> = {
  [K in keyof T]: T[K] extends Ref<infer V> ? V : T[K];
};

/**
 * Maps every property of `T` to a `Ref` of that property.
 *
 * @example
 * ```ts
 * type Foo = { a: number; b: string };
 * type Refs = ToRefs<Foo>; // { a: Ref<number>; b: Ref<string> }
 * const refs: Refs = { a: { value: 1 }, b: { value: 'x' } };
 * console.log(refs.a.value, refs.b.value); // 1 'x'
 * ```
 */
export type ToRefs<T> = {
  [K in keyof T]: Ref<T[K]>;
};
