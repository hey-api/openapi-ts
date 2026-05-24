import type { Coercer, ValueToObject } from '../../../config/utils/config';
import type { Plugin } from '../../types';

export const definePluginConfig =
  <T extends Plugin.Types>(defaultConfig: Plugin.Config<T>) =>
  (
    userConfig?: Omit<T['config'], 'name'>,
  ): Omit<Plugin.Config<T>, 'name'> & {
    /**
     * Cast name to `any` so it doesn't throw type error in `plugins` array.
     * We could allow any `string` as plugin `name` in the object syntax, but
     * that TypeScript trick would cause all string methods to appear as
     * suggested auto completions, which is undesirable.
     */
    name: any;
  } => ({
    ...defaultConfig,
    config: {
      ...defaultConfig.config,
      ...userConfig,
    },
  });

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
    ? O extends (...args: any[]) => any
      ? never
      : O
    : never;

type DeepSpec<Out, In> = [Out] extends [(...args: any[]) => any]
  ? [NonNullable<In>] extends [Out]
    ? Out | Coercer<In, Out>
    : Coercer<In, Out>
  : [Out] extends [object]
    ? {
        [K in keyof Out]: DeepSpec<
          Out[K],
          K extends keyof ObjectMember<In> ? ObjectMember<In>[K] : undefined
        >;
      }
    : [NonNullable<In>] extends [Out]
      ? Out | Coercer<In, Out>
      : Coercer<In, Out>;

export type NormalizerTable<TResolved, TInput> = {
  [K in keyof TResolved as [TResolved[K]] extends [(...a: any[]) => any]
    ? never
    : [TResolved[K]] extends [object]
      ? K
      : never]?: DeepSpec<TResolved[K], K extends keyof TInput ? TInput[K] : undefined>;
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
    const toObject = context.valueToObject as unknown as (args: {
      defaultValue: Record<string, unknown>;
      mappers: typeof mappers;
      value: unknown;
    }) => Record<string, unknown>;

    const defaults = typeof table === 'function' ? table(config, context) : table;
    const target = config as Record<string, unknown>;
    for (const [key, defaultValue] of Object.entries(defaults)) {
      target[key] = toObject({
        defaultValue: defaultValue as Record<string, unknown>,
        mappers,
        value: target[key],
      });
    }

    return config as unknown as TResolved;
  };
}
