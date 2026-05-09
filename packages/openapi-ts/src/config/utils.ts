import type { Context, PluginInstance } from '@hey-api/shared';
import type { Config } from './types';

type PluginWithContext = Pick<PluginInstance, 'context'>;
type PluginWithConfig = Pick<Context, 'config'>;

export function getTypedConfig(
  plugin: PluginWithContext | PluginWithConfig,
): Config {
  if ('context' in plugin && plugin.context?.config) {
    return plugin.context.config as unknown as Config;
  }

  if ('config' in plugin) {
    return plugin.config as unknown as Config;
  }

  // fallback safety (should never happen)
  return {} as Config;
}