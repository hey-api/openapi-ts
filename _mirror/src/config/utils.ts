import type { Context, PluginInstance } from '@hey-api/shared';

import type { Config } from './types';

export function getTypedConfig(
  plugin: Pick<PluginInstance, 'context'> | Pick<Context, 'config'>,
): Config {
  if ('context' in plugin) {
    return plugin.context.config as Config;
  }
  return plugin.config as Config;
}
