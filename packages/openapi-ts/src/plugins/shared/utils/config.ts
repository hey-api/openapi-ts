import type { Plugin } from '~/plugins/types';

export const definePluginConfig =
  <T extends Plugin.Types>(defaultConfig: Plugin.Config<T>) =>
  (
    userConfig?: Omit<Plugin.UserConfig<T['config']>, 'name'>,
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
  function: (name: (...args: any[]) => any) => ({ name }),
  string: (name: string) => ({ name }),
} as const;
