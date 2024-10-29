import type { Config } from '../types/config';

let _config: Config;

export const getConfig = () => _config;

export const setConfig = (config: Config) => {
  _config = config;
  return getConfig();
};

export const isLegacyClient = (config: Config | Config['client']) => {
  const client = 'client' in config ? config.client.name : config.name;
  return client.startsWith('legacy/');
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
