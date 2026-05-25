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

export type WithCoercers<T> = [T] extends [(...args: any[]) => any]
  ? T | Coercer<any, T>
  : [T] extends [object]
    ? { [K in keyof T]: WithCoercers<T[K]> } | Coercer<any, T>
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

const isPlainObject = (value: unknown): value is Record<string, any> => {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const mergeResult = <T>(result: ObjectType<T>, mapped: Record<string, any>): ObjectType<T> => {
  for (const [key, value] of Object.entries(mapped)) {
    if (value !== undefined && value !== '') {
      (result as Record<string, any>)[key] = value;
    }
  }
  return result;
};

const COERCER = Symbol('coercer');

export type Coercer<In = any, Out = any> = { readonly [COERCER]: (value: In) => Out };

export const coerce = <In, Out>(fn: (value: In) => Out): Coercer<In, Out> => ({ [COERCER]: fn });

const isCoercer = (value: unknown): value is Coercer =>
  typeof value === 'object' && value !== null && COERCER in value;

export const valueToObject: ValueToObject = ({ defaultValue, mappers, value }) => {
  const result: Record<string, any> = {};
  for (const [key, dv] of Object.entries(defaultValue as Record<string, any>)) {
    if (isCoercer(dv)) result[key] = dv[COERCER](undefined);
    else if (isPlainObject(dv))
      result[key] = valueToObject({ defaultValue: dv, mappers, value: undefined } as any);
    else result[key] = dv;
  }

  switch (typeof value) {
    case 'boolean':
      if (mappers && 'boolean' in mappers) {
        mergeResult(result, (mappers.boolean as (v: boolean) => Record<string, any>)(value));
      }
      break;
    case 'function':
      if (mappers && 'function' in mappers) {
        mergeResult(
          result,
          (mappers.function as (v: (...a: Array<any>) => any) => Record<string, any>)(value as any),
        );
      }
      break;
    case 'number':
      if (mappers && 'number' in mappers) {
        mergeResult(result, (mappers.number as (v: number) => Record<string, any>)(value));
      }
      break;
    case 'string':
      if (mappers && 'string' in mappers) {
        mergeResult(result, (mappers.string as (v: string) => Record<string, any>)(value));
      }
      break;
    case 'object':
      if (isPlainObject(value)) {
        if ('enabled' in defaultValue) {
          result['enabled'] = true;
        }
        for (const [key, v] of Object.entries(value)) {
          const dv = (defaultValue as Record<string, any>)[key];
          if (isCoercer(dv)) result[key] = dv[COERCER](v);
          else if (v === undefined || v === '') continue;
          else if (isPlainObject(dv))
            result[key] = valueToObject({ defaultValue: dv, mappers, value: v } as any);
          else result[key] = v;
        }
      }
      break;
  }

  return result as any;
};
