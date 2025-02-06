import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import type { Config } from '../types/config';

let _config: Config;

export const getConfig = () => {
  const config = _config;
  const plugin = getClientPlugin(config);
  // patch legacy config to avoid breaking handlebars
  // @ts-expect-error
  config.client = plugin;
  return config;
};

export const setConfig = (config: Config) => {
  _config = config;
  return getConfig();
};

export const isLegacyClient = (config: Config) => {
  const plugin = getClientPlugin(config);
  return plugin.name.startsWith('legacy/');
};

/**
 * Wrap legacy `name` option so we don't use it when not using legacy clients.
 */
export const legacyNameFromConfig = (config: Config) => {
  if (!isLegacyClient(config)) {
    return;
  }

  return config.name;
};
