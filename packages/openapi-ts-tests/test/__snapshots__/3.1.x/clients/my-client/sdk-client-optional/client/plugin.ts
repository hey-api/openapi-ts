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
  name: string;
}

export const defaultConfig: Plugin.Config<Config> = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler: clientPluginHandler,
  name: __filename,
};

/**
 * Type helper for `my-client` plugin, returns {@link Plugin.Config} object
 */
export const myClientPlugin = definePluginConfig(defaultConfig);
