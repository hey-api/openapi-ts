import type { Config } from '../types/config';

let _config: Config;

export const getConfig = () => _config;

export const setConfig = (config: Config) => {
  _config = config;
  return getConfig();
};

export const isStandaloneClient = (config: Config | Config['client']) => {
  const client = typeof config === 'string' ? config : config.client;
  return client.startsWith('@hey-api');
};
