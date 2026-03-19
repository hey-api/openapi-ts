/**
 * Ref wrapper which ensures a stable reference for a value.
 *
 * @example
 * ```ts
 * type NumRef = Ref<number>; // { '~ref': number }
 * const num: NumRef = { '~ref': 42 };
 * console.log(num['~ref']); // 42
 * ```
 */
export type Ref<T> = T extends { ['~ref']: unknown } ? T : { '~ref': T };

/**
 * Maps every property of `T` to a `Ref` of that property.
 *
 * @example
 * ```ts
 * type Foo = { a: number; b: string };
 * type Refs = Refs<Foo>; // { a: Ref<number>; b: Ref<string> }
 * const refs: Refs = { a: { '~ref': 1 }, b: { '~ref': 'x' } };
 * console.log(refs.a['~ref'], refs.b['~ref']); // 1 'x'
 * ```
 */
export type Refs<T> = {
  [K in keyof T]: Ref<T[K]>;
};

/**
 * Unwraps a Ref to its value type.
 *
 * @example
 * ```ts
 * type N = FromRef<{ '~ref': number }>; // number
 * ```
 */
export type FromRef<T> = T extends { '~ref': infer U } ? U : T;

/**
 * Maps every property of a Ref-wrapped object back to its plain value.
 *
 * @example
 * ```ts
 * type Foo = { a: number; b: string };
 * type Refs = Refs<Foo>; // { a: Ref<number>; b: Ref<string> }
 * type Foo2 = FromRefs<Refs>; // { a: number; b: string }
 * ```
 */
export type FromRefs<T> = {
  [K in keyof T]: T[K] extends Ref<infer U> ? U : T[K];
};
