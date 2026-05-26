import type { Coercer, InlineDirectives, ValueToObject } from '../../../config/utils/config';
import { isPlainObject } from '../../../config/utils/config';
import type { Plugin } from '../../types';

export const pluginUserConfigSymbol = Symbol('pluginUserConfig');

export function definePluginConfig<T extends Plugin.Types>(defaultConfig: Plugin.Config<T>) {
  return (userConfig?: Omit<T['config'], 'name'>) => {
    const config = {
      ...defaultConfig,
      config: (typeof defaultConfig.config === 'function'
        ? defaultConfig.config
        : { ...defaultConfig.config, ...(userConfig ?? {}) }) as Plugin.Config<T>['config'],
      /**
       * Cast name to `any` so it doesn't throw type error in `plugins` array.
       * We could allow any `string` as plugin `name` in the object syntax, but
       * that TypeScript trick would cause all string methods to appear as
       * suggested auto completions, which is undesirable.
       */
      name: defaultConfig.name as any,
    };

    if (typeof defaultConfig.config === 'function') {
      Object.defineProperty(config, pluginUserConfigSymbol, { value: userConfig ?? {} });
    }

    return config;
  };
}

/**
 * Reusable mappers for `enabled` and `name` fields.
 */
export const mappers = {
  boolean: (enabled: boolean) => ({ enabled }),
  function: (name: (...args: Array<any>) => any) => ({ enabled: true, name }),
  string: (name: string) => ({ enabled: true, name }),
} as const;

type ObjectMember<T> =
  Extract<T, Record<string, any>> extends infer O
    ? O extends (...args: Array<any>) => any
      ? never
      : O
    : never;

type TableSpec<Out, In> = [Out] extends [(...args: Array<any>) => any]
  ? [NonNullable<In>] extends [Out]
    ? Out | Coercer<In, Out>
    : Coercer<In, Out>
  : [Out] extends [object]
    ? {
        [K in keyof Out]?: TableSpec<
          Out[K],
          K extends keyof ObjectMember<In> ? ObjectMember<In>[K] : undefined
        >;
      } & InlineDirectives<Out>
    : [NonNullable<In>] extends [Out]
      ? Out | Coercer<In, Out>
      : Coercer<In, Out>;

function mergeAncestor(
  ancestor: Record<string, unknown>,
  target: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };

  for (const [key, av] of Object.entries(ancestor)) {
    if (!(key in result)) {
      result[key] = av;
    } else if (isPlainObject(av) && isPlainObject(result[key])) {
      result[key] = mergeAncestor(
        av as Record<string, unknown>,
        result[key] as Record<string, unknown>,
      );
    }
  }

  for (const [key, rv] of Object.entries(result)) {
    if (isPlainObject(rv) && !(key in ancestor)) {
      result[key] = mergeAncestor(ancestor, rv as Record<string, unknown>);
    }
  }

  return result;
}

type NormalizerTableEntries<TResolved, TInput> = {
  [K in keyof TResolved as [TResolved[K]] extends [(...args: Array<any>) => any]
    ? never
    : K]?: TableSpec<
    TResolved[K],
    K extends keyof ObjectMember<TInput> ? ObjectMember<TInput>[K] : undefined
  >;
};

export type NormalizerTable<TResolved extends object, TInput> = NormalizerTableEntries<
  TResolved,
  TInput
> &
  InlineDirectives<TResolved> & {
    readonly $cascade?: ReadonlyArray<keyof TInput & string>;
  };

export function defineNormalizers<
  TResolved extends object,
  TInput extends object = Record<string, unknown>,
>(
  table:
    | NormalizerTable<TResolved, TInput>
    | ((
        config: TInput,
        context: { valueToObject: ValueToObject },
      ) => NormalizerTable<TResolved, TInput>),
) {
  return (config: TInput, context: { valueToObject: ValueToObject }): TResolved => {
    function toScalar(defaultValue: unknown, value: unknown): unknown {
      return toObject({
        defaultValue: { value: defaultValue },
        mappers,
        value: value === undefined || value === '' ? undefined : { value },
      }).value;
    }

    const toObject = context.valueToObject as unknown as (args: {
      defaultValue: Record<string, unknown>;
      mappers: typeof mappers;
      value: unknown;
    }) => Record<string, unknown>;

    const resolved = typeof table === 'function' ? table(config, context) : table;

    const { $cascade: cascadeKeys = [], ...entries } = resolved as Record<string, unknown> & {
      $cascade?: ReadonlyArray<string>;
    };

    const target = config as Record<string, unknown>;

    const ancestor: Record<string, unknown> = {};

    for (const key of cascadeKeys) {
      if (!(key in entries)) {
        ancestor[key] = target[key];
      }
    }

    const cascadeTableKeys = cascadeKeys.filter((k) => k in entries);
    for (const key of cascadeTableKeys) {
      const defaultValue = entries[key];
      if (isPlainObject(defaultValue)) {
        target[key] = toObject({
          defaultValue: defaultValue as Record<string, unknown>,
          mappers,
          value: target[key],
        });
      } else {
        target[key] = toScalar(defaultValue, target[key]);
      }
      ancestor[key] = target[key];
    }

    for (const [key, defaultValue] of Object.entries(entries)) {
      if (cascadeTableKeys.includes(key)) continue; // already resolved above

      if (isPlainObject(defaultValue)) {
        target[key] = toObject({
          defaultValue: mergeAncestor(ancestor, defaultValue as Record<string, unknown>),
          mappers,
          value: target[key],
        });
      } else {
        target[key] = toScalar(defaultValue, target[key]);
      }
    }

    return config as unknown as TResolved;
  };
}
