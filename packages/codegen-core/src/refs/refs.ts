import type { FromRefs, Ref, Refs } from './types';

/**
 * Wraps a single value in a Ref object.
 *
 * @example
 * ```ts
 * const r = ref(123); // { '~ref': 123 }
 * console.log(r['~ref']); // 123
 * ```
 */
export const ref = <T>(value: T): Ref<T> => ({ '~ref': value });

/**
 * Converts a plain object to an object of Refs (deep, per property).
 *
 * @example
 * ```ts
 * const obj = { a: 1, b: "x" };
 * const refs = refs(obj); // { a: { '~ref': 1 }, b: { '~ref': "x" } }
 * ```
 */
export const refs = <T extends Record<string, unknown>>(obj: T): Refs<T> => {
  const result = {} as Refs<T>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = ref(obj[key]);
    }
  }
  return result;
};

/**
 * Unwraps a single Ref object to its value.
 *
 * @example
 * ```ts
 * const r = { '~ref': 42 };
 * const n = fromRef(r); // 42
 * console.log(n); // 42
 * ```
 */
export const fromRef = <T extends Ref<unknown> | undefined>(
  ref: T,
): T extends Ref<infer U> ? U : undefined =>
  ref?.['~ref'] as T extends Ref<infer U> ? U : undefined;

/**
 * Converts an object of Refs back to a plain object (unwraps all refs).
 *
 * @example
 * ```ts
 * const refs = { a: { '~ref': 1 }, b: { '~ref': "x" } };
 * const plain = fromRefs(refs); // { a: 1, b: "x" }
 * ```
 */
export const fromRefs = <T extends Refs<Record<string, unknown>>>(
  obj: T,
): FromRefs<T> => {
  const result = {} as FromRefs<T>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = fromRef(obj[key]!) as (typeof result)[typeof key];
    }
  }
  return result;
};

/**
 * Checks whether a value is a Ref object.
 *
 * @param value Value to check
 * @returns True if the value is a Ref object.
 */
export const isRef = <T>(value: unknown): value is Ref<T> =>
  typeof value === 'object' && value !== null && '~ref' in value;
