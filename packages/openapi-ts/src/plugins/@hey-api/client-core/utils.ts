import type { Config } from '../../../types/config';
import type { PluginClientNames } from '../../types';

export const clientId = 'client';

type Plugins = Required<Config>['plugins'];

export const getClientBaseUrlKey = (config: Config) => {
  const client = getClientPlugin(config);
  if (
    client.name === '@hey-api/client-axios' ||
    client.name === '@hey-api/client-nuxt'
  ) {
    return 'baseURL';
  }
  return 'baseUrl';
};

export const getClientPlugin = (
  config: Config,
): Required<Plugins>[PluginClientNames] => {
  for (const name of config.pluginOrder) {
    const plugin = config.plugins[name];
    if (plugin?.tags?.includes('client')) {
      return plugin as Required<Plugins>[PluginClientNames];
    }
  }

  return {
    config: {},
    // @ts-expect-error
    name: '',
  };
};
