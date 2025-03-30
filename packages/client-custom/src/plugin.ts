import {
  clientDefaultConfig,
  clientPluginHandler,
  type Plugin,
} from '@hey-api/openapi-ts';

export interface Config {
  /**
   * Plugin name. Must be unique.
   */
  name: 'my-client';
}

export const defaultConfig: Plugin.Config<Config> = {
  ...clientDefaultConfig,
  _handler: clientPluginHandler,
  _handlerLegacy: () => {},
  name: 'my-client',
};

/**
 * Type helper for `my-client` plugin, returns {@link Plugin.Config} object
 */
export const customClientPlugin: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
