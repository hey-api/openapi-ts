import type { Config } from '../../../config/types';
import type { PluginClientNames } from '../../../plugins/types';

export function getClientPlugin(
  config: Config,
): Config['plugins'][PluginClientNames] & { name: PluginClientNames } {
  for (const name of config.pluginOrder) {
    const plugin = config.plugins[name];
    if (plugin?.tags?.includes('client')) {
      return plugin as Config['plugins'][PluginClientNames] & {
        name: PluginClientNames;
      };
    }
  }

  return {
    config: {
      // @ts-expect-error
      name: '',
    },
    // @ts-expect-error
    name: '',
  };
}
