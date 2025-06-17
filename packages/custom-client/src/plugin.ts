import {
  type Client,
  clientDefaultConfig,
  clientDefaultMeta,
  clientPluginHandler,
  definePluginConfig,
  type Plugin,
} from '@hey-api/openapi-ts';

export interface Config extends Client.Config {
  /**
   * Plugin name. Must be unique.
   */
  name: '@hey-api/custom-client';
}

export const defaultConfig: Plugin.Config<Config> = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    bundle: false,
  },
  handler: clientPluginHandler,
  handlerLegacy: () => {},
  name: '@hey-api/custom-client',
};

/**
 * Type helper for `@hey-api/custom-client` plugin, returns {@link Plugin.Config} object
 */
export const customClientPlugin = definePluginConfig(defaultConfig);
