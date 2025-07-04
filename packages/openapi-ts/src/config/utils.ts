type ObjectType<T> =
  Extract<T, Record<string, any>> extends never
    ? Record<string, any>
    : Extract<T, Record<string, any>>;

export type ValueToObject = <
  T extends undefined | string | boolean | number | Record<string, any>,
>(args: {
  defaultValue: ObjectType<T>;
  mappers: {
    boolean: T extends boolean
      ? (value: boolean) => Partial<ObjectType<T>>
      : never;
    number: T extends number
      ? (value: number) => Partial<ObjectType<T>>
      : never;
    object?: (value: Partial<ObjectType<T>>) => Partial<ObjectType<T>>;
    string: T extends string
      ? (value: string) => Partial<ObjectType<T>>
      : never;
  } extends infer U
    ? { [K in keyof U as U[K] extends never ? never : K]: U[K] }
    : never;
  value: T;
}) => ObjectType<T>;

const mergeResult = <T>(
  result: ObjectType<T>,
  mapped: Record<string, any>,
): ObjectType<T> => {
  for (const [key, value] of Object.entries(mapped)) {
    if (value !== undefined && value !== '') {
      (result as Record<string, any>)[key] = value;
    }
  }
  return result;
};

export const valueToObject: ValueToObject = ({
  defaultValue,
  mappers,
  value,
}) => {
  let result = { ...defaultValue };

  switch (typeof value) {
    case 'boolean':
      if ('boolean' in mappers) {
        const mapper = mappers.boolean as (
          value: boolean,
        ) => Record<string, any>;
        result = mergeResult(result, mapper(value));
      }
      break;
    case 'number':
      if ('number' in mappers) {
        const mapper = mappers.number as (value: number) => Record<string, any>;
        result = mergeResult(result, mapper(value));
      }
      break;
    case 'string':
      if ('string' in mappers) {
        const mapper = mappers.string as (value: string) => Record<string, any>;
        result = mergeResult(result, mapper(value));
      }
      break;
    case 'object':
      if (value !== null) {
        if ('object' in mappers && typeof mappers.object === 'function') {
          const mapper = mappers.object as (
            value: Record<string, any>,
          ) => Partial<ObjectType<any>>;
          result = mergeResult(result, mapper(value));
        } else {
          result = mergeResult(result, value);
        }
      }
      break;
  }

  return result;
};
