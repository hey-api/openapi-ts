import type { Plugin } from '../../types';

export function definePluginConfig<T extends Plugin.Types>(pluginConfig: Plugin.Config<T>) {
  return (userConfig?: Omit<T['config'], 'name'>) => ({
    ...pluginConfig,
    config: { ...pluginConfig.config, ...(userConfig ?? {}) } as Plugin.Config<T>['config'],
    /**
     * Cast name to `any` so it doesn't throw type error in `plugins` array.
     * We could allow any `string` as plugin `name` in the object syntax, but
     * that TypeScript trick would cause all string methods to appear as
     * suggested auto completions, which is undesirable.
     */
    name: pluginConfig.name as any,
  });
}
