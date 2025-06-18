import type { BaseConfig, Plugin } from '../../types';

export const definePluginConfig =
  <Config extends BaseConfig, ResolvedConfig extends BaseConfig = Config>(
    defaultConfig: Plugin.Config<Config, ResolvedConfig>,
  ) =>
  (
    userConfig?: Omit<Plugin.UserConfig<Config>, 'name'>,
  ): Omit<Plugin.Config<Config, ResolvedConfig>, 'name'> & {
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
