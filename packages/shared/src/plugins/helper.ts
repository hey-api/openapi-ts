import type { PluginConfigMap } from './types';

type PluginConfig<K extends keyof PluginConfigMap> = PluginConfigMap[K]['config'] & { name: K };

type PluginHelper<K extends keyof PluginConfigMap> = (
  config?: Omit<PluginConfigMap[K]['config'], 'name'>,
) => PluginConfig<K>;

export function pluginHelper<K extends keyof PluginConfigMap>(name: K): PluginHelper<K> {
  return (config?) => ({ ...config, name }) as PluginConfig<K>;
}
