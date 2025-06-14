import {
  type Client,
  clientDefaultConfig,
  clientPluginHandler,
  type Plugin,
} from '@hey-api/openapi-ts';

export interface Config extends Client.Config {
  /**
   * Plugin name. Must be unique.
   */
  name: '@hey-api/custom-client';
}

export const defaultConfig: Plugin.Config<Config> = {
  ...clientDefaultConfig,
  _handler: clientPluginHandler,
  _handlerLegacy: () => {},
  bundle: false,
  name: '@hey-api/custom-client',
};

/**
 * Type helper for `@hey-api/custom-client` plugin, returns {@link Plugin.Config} object
 */
export const customClientPlugin: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
