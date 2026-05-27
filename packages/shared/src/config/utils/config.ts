type ObjectType<T> =
  Extract<T, Record<string, any>> extends never
    ? Record<string, any>
    : Extract<T, Record<string, any>>;

type NotArray<T> = T extends Array<any> ? never : T;
type NotFunction<T> = T extends (...args: Array<any>) => any ? never : T;
type PlainObject<T> = T extends object
  ? NotFunction<T> extends never
    ? never
    : NotArray<T> extends never
      ? never
      : T
  : never;

type MappersType<T> = {
  boolean: T extends boolean ? (value: boolean) => Partial<ObjectType<T>> : never;
  function: T extends (...args: Array<any>) => any
    ? (value: (...args: Array<any>) => any) => Partial<ObjectType<T>>
    : never;
  number: T extends number ? (value: number) => Partial<ObjectType<T>> : never;
  object?: PlainObject<T> extends never
    ? never
    : (value: Partial<PlainObject<T>>, defaultValue: PlainObject<T>) => Partial<ObjectType<T>>;
  string: T extends string ? (value: string) => Partial<ObjectType<T>> : never;
} extends infer U
  ? { [K in keyof U as U[K] extends never ? never : K]?: U[K] }
  : never;

type IsObjectOnly<T> = T extends Record<string, any> | undefined
  ? Extract<T, string | boolean | number | ((...args: Array<any>) => any)> extends never
    ? true
    : false
  : false;

export type CoerceMap<TShape extends object = object> = {
  boolean?: (value: boolean) => Partial<TShape>;
  function?: (value: (...args: Array<any>) => any) => Partial<TShape>;
  number?: (value: number) => Partial<TShape>;
  string?: (value: string) => Partial<TShape>;
};

type CoercionEvent =
  | { type: 'boolean'; value: boolean }
  | { type: 'function'; value: (...args: Array<any>) => any }
  | { type: 'number'; value: number }
  | { type: 'object'; value: Record<string, any> }
  | { type: 'string'; value: string };

export type InlineDirectives<TShape extends object = object> = {
  /**
   * Per-type coercers. Each handler receives the raw user input of the matching
   * type and returns a partial object merged into the resolved config. Applied
   * after `$onCoerce`.
   *
   * @example
   * ```ts
   * $coerce: {
   *   string: (v) => ({ name: v }),
   *   function: (v) => ({ name: v }),
   * }
   * ```
   */
  $coerce?: CoerceMap<TShape>;
  /**
   * Fires for any non-`undefined` input before type-specific `$coerce` handlers.
   * Use to declare baseline behavior shared across all coercion paths. Its result
   * is merged first, so type-specific `$coerce` handlers and plain-object keys
   * always win over it.
   *
   * @example
   * ```ts
   * // Enable the feature on any shorthand; disable only on explicit `false`
   * $onCoerce: (v) => ({ enabled: v !== false })
   * ```
   */
  $onCoerce?: (value: CoercionEvent) => Partial<TShape>;
};

export type WithCoercers<T> = [T] extends [(...args: Array<any>) => any]
  ? T | Coercer<any, T>
  : [T] extends [object]
    ? ({ [K in keyof T]: WithCoercers<T[K]> } & InlineDirectives<T>) | Coercer<any, T>
    : T | Coercer<any, T>;

export type ValueToObject = <
  T extends
    | undefined
    | string
    | boolean
    | number
    | ((...args: Array<any>) => any)
    | Record<string, any>,
>(
  args: {
    defaultValue: WithCoercers<ObjectType<T>>;
    value: T;
  } & (IsObjectOnly<T> extends true
    ? {
        mappers?: MappersType<T>;
      }
    : {
        mappers: MappersType<T>;
      }),
) => PlainObject<T>;

export function isPlainObject(value: unknown): value is Record<string, any> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function mergeResult<T>(result: ObjectType<T>, mapped: Record<string, any>): ObjectType<T> {
  for (const [key, value] of Object.entries(mapped)) {
    if (value !== undefined && value !== '') {
      (result as Record<string, any>)[key] = value;
    }
  }
  return result;
}

const COERCER = Symbol('coercer');

export type Coercer<In = any, Out = any> = { readonly [COERCER]: (value: In) => Out };

export function coerce<In, Out>(fn: (value: In) => Out): Coercer<In, Out> {
  return { [COERCER]: fn };
}

function isCoercer(value: unknown): value is Coercer {
  return typeof value === 'object' && value !== null && COERCER in value;
}

export const valueToObject: ValueToObject = ({ defaultValue, mappers, value }) => {
  const result: Record<string, any> = {};
  const dv = defaultValue as Record<string, any> & InlineDirectives;

  for (const [key, defaultVal] of Object.entries(dv)) {
    if (key === '$coerce' || key === '$onCoerce') continue;
    if (isCoercer(defaultVal)) {
      result[key] = defaultVal[COERCER](undefined);
    } else if (isPlainObject(defaultVal)) {
      result[key] = valueToObject({ defaultValue: defaultVal, mappers, value: undefined } as any);
    } else result[key] = defaultVal;
  }

  if (value !== undefined && value !== null && dv.$onCoerce) {
    mergeResult(result, dv.$onCoerce({ type: typeof value, value } as CoercionEvent));
  }

  switch (typeof value) {
    case 'boolean': {
      const mapper = dv.$coerce?.boolean;
      if (mapper) {
        mergeResult(result, mapper(value));
      } else if (mappers && 'boolean' in mappers) {
        mergeResult(result, (mappers.boolean as (v: boolean) => Record<string, any>)(value));
      }
      break;
    }
    case 'function': {
      const mapper = dv.$coerce?.function;
      if (mapper) {
        mergeResult(result, mapper(value as (...args: Array<any>) => any));
      } else if (mappers && 'function' in mappers) {
        mergeResult(
          result,
          (mappers.function as (v: (...a: Array<any>) => any) => Record<string, any>)(value as any),
        );
      }
      break;
    }
    case 'number': {
      const mapper = dv.$coerce?.number;
      if (mapper) {
        mergeResult(result, mapper(value));
      } else if (mappers && 'number' in mappers) {
        mergeResult(result, (mappers.number as (v: number) => Record<string, any>)(value));
      }
      break;
    }
    case 'string': {
      const mapper = dv.$coerce?.string;
      if (mapper) {
        mergeResult(result, mapper(value));
      } else if (mappers && 'string' in mappers) {
        mergeResult(result, (mappers.string as (v: string) => Record<string, any>)(value));
      }
      break;
    }
    case 'object':
      if (isPlainObject(value)) {
        if ('enabled' in dv) {
          result['enabled'] = true;
        }
        for (const [key, v] of Object.entries(value)) {
          const defaultVal = dv[key];
          if (isCoercer(defaultVal)) {
            result[key] = defaultVal[COERCER](v);
          } else if (v === undefined || v === '') {
            continue;
          } else if (isPlainObject(defaultVal)) {
            result[key] = valueToObject({ defaultValue: defaultVal, mappers, value: v } as any);
          } else {
            result[key] = v;
          }
        }
      }
      break;
  }

  return result as any;
};
