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
  name: '@hey-api/client-custom';
}

export const defaultConfig: Plugin.Config<Config> = {
  ...clientDefaultConfig,
  _handler: clientPluginHandler,
  _handlerLegacy: () => {},
  name: '@hey-api/client-custom',
};

/**
 * Type helper for `@hey-api/client-custom` plugin, returns {@link Plugin.Config} object
 */
export const customClientPlugin: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
