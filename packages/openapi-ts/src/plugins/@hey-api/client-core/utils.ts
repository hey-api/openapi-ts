import type { Config } from '../../../types/config';
import type { PluginClientNames } from '../../types';

export const clientId = 'client';

type Plugins = Required<Config>['plugins'];

export const getClientPlugin = (
  config: Config,
): Required<Plugins>[PluginClientNames] => {
  for (const name of config.pluginOrder) {
    const plugin = config.plugins[name];
    if (plugin?._tags?.includes('client')) {
      return plugin as Required<Plugins>[PluginClientNames];
    }
  }

  return {
    // @ts-expect-error
    name: '',
  };
};
